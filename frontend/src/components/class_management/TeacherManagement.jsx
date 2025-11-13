import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, Tabs, Tab, ProgressBar } from 'react-bootstrap';

/**
 * Teacher Management Component
 * Quản lý giảng viên - profile, phân công lớp, lịch dạy
 */
const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: [],
    qualifications: '',
    experience: '',
    status: 'active'
  });

  const specializationOptions = [
    'Speaking',
    'Listening',
    'Reading',
    'Writing',
    'Grammar',
    'IELTS',
    'TOEIC',
    'Business English'
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    // Mock data
    const mockTeachers = [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        specialization: ['Speaking', 'IELTS'],
        qualifications: 'CELTA, Master in English',
        experience: 8,
        status: 'active',
        currentClasses: 3,
        totalStudents: 75,
        rating: 4.8,
        totalLessons: 120,
        completedLessons: 85,
        avatar: null
      },
      {
        id: 2,
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0901234568',
        specialization: ['Listening', 'Grammar'],
        qualifications: 'TESOL, Bachelor in English',
        experience: 5,
        status: 'active',
        currentClasses: 2,
        totalStudents: 50,
        rating: 4.6,
        totalLessons: 80,
        completedLessons: 60
      },
      {
        id: 3,
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0901234569',
        specialization: ['TOEIC', 'Business English'],
        qualifications: 'CELTA, Bachelor in Business',
        experience: 6,
        status: 'active',
        currentClasses: 4,
        totalStudents: 100,
        rating: 4.9,
        totalLessons: 150,
        completedLessons: 110
      },
      {
        id: 4,
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        phone: '0901234570',
        specialization: ['Writing', 'Reading'],
        qualifications: 'TEFL, Master in Literature',
        experience: 4,
        status: 'inactive',
        currentClasses: 0,
        totalStudents: 0,
        rating: 4.5,
        totalLessons: 60,
        completedLessons: 45
      }
    ];
    setTeachers(mockTeachers);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecializationToggle = (spec) => {
    setFormData(prev => {
      const newSpec = prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec];
      return { ...prev, specialization: newSpec };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingTeacher) {
      setTeachers(teachers.map(t => 
        t.id === editingTeacher.id 
          ? { ...t, ...formData }
          : t
      ));
      alert('Cập nhật giảng viên thành công!');
    } else {
      const newTeacher = {
        ...formData,
        id: teachers.length + 1,
        currentClasses: 0,
        totalStudents: 0,
        rating: 0,
        totalLessons: 0,
        completedLessons: 0
      };
      setTeachers([...teachers, newTeacher]);
      alert('Thêm giảng viên thành công!');
    }
    
    handleCloseModal();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      specialization: teacher.specialization,
      qualifications: teacher.qualifications,
      experience: teacher.experience,
      status: teacher.status
    });
    setShowModal(true);
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giảng viên này?')) return;
    
    setTeachers(teachers.filter(t => t.id !== teacherId));
    alert('Xóa giảng viên thành công!');
  };

  const handleViewDetail = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: [],
      qualifications: '',
      experience: '',
      status: 'active'
    });
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <Badge className="bg-success-600 text-white px-12 py-6">Đang hoạt động</Badge>
      : <Badge className="bg-neutral-500 text-white px-12 py-6">Tạm nghỉ</Badge>;
  };

  const getRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <i 
        key={i} 
        className={`fas fa-star ${i < Math.floor(rating) ? 'text-warning-600' : 'text-neutral-300'}`}
        style={{ fontSize: '14px' }}
      ></i>
    ));
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    totalClasses: teachers.reduce((sum, t) => sum + t.currentClasses, 0),
    totalStudents: teachers.reduce((sum, t) => sum + t.totalStudents, 0),
    avgRating: (teachers.reduce((sum, t) => sum + t.rating, 0) / teachers.length).toFixed(1)
  };

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Quản lý Giảng viên</h4>
          <p className="text-neutral-600 mb-0">Quản lý thông tin và phân công giảng viên</p>
        </div>
        <Button className="btn-main px-20 py-12 radius-8" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i>
          Thêm giảng viên
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
                  <i className="fas fa-user-tie text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng giảng viên</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.total}</div>
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
                  <div className="text-neutral-900 fw-bold text-32">{stats.active}</div>
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
                  <i className="fas fa-chalkboard-teacher text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Lớp đang dạy</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.totalClasses}</div>
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
                  <i className="fas fa-star text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Đánh giá TB</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.avgRating}</div>
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
              <Form.Control
                type="text"
                placeholder="Tìm kiếm giảng viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="radius-8"
              />
            </Col>
            <Col md={3}>
              <Form.Select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="radius-8"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm nghỉ</option>
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

      {/* Teachers Display */}
      {viewMode === 'grid' ? (
        <Row className="g-3">
          {filteredTeachers.map(teacher => (
            <Col md={6} lg={4} key={teacher.id}>
              <Card className="bg-white border border-neutral-100 rounded-12 box-shadow-sm h-100 hover-shadow transition-2">
                <Card.Body className="p-20">
                  {/* Header */}
                  <div className="d-flex align-items-start gap-16 mb-16">
                    <div 
                      className="rounded-circle bg-main-100 d-flex align-items-center justify-content-center text-main-600 fw-bold"
                      style={{ width: '56px', height: '56px', fontSize: '20px', minWidth: '56px' }}
                    >
                      {teacher.name.charAt(0)}
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <h6 className="text-neutral-900 fw-bold mb-4">{teacher.name}</h6>
                      <div className="text-neutral-600 text-12 mb-4">{teacher.email}</div>
                      <div className="d-flex gap-4">
                        {getRatingStars(teacher.rating)}
                        <span className="text-neutral-600 text-12 ms-2">{teacher.rating}</span>
                      </div>
                    </div>
                    {getStatusBadge(teacher.status)}
                  </div>

                  {/* Specialization */}
                  <div className="mb-16">
                    <div className="text-neutral-600 text-12 mb-8">Chuyên môn</div>
                    <div className="d-flex flex-wrap gap-4">
                      {teacher.specialization.slice(0, 3).map(spec => (
                        <Badge key={spec} className="bg-main-100 text-main-600 px-8 py-4 text-11">
                          {spec}
                        </Badge>
                      ))}
                      {teacher.specialization.length > 3 && (
                        <Badge className="bg-neutral-100 text-neutral-600 px-8 py-4 text-11">
                          +{teacher.specialization.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="border-top border-neutral-100 pt-16 mb-16">
                    <Row className="g-2 text-center">
                      <Col xs={4}>
                        <div className="text-neutral-500 text-11 mb-4">Lớp dạy</div>
                        <div className="text-neutral-900 fw-bold text-14">{teacher.currentClasses}</div>
                      </Col>
                      <Col xs={4}>
                        <div className="text-neutral-500 text-11 mb-4">Học viên</div>
                        <div className="text-main-600 fw-bold text-14">{teacher.totalStudents}</div>
                      </Col>
                      <Col xs={4}>
                        <div className="text-neutral-500 text-11 mb-4">Kinh nghiệm</div>
                        <div className="text-neutral-900 fw-bold text-14">{teacher.experience} năm</div>
                      </Col>
                    </Row>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-8">
                    <Button 
                      className="btn-outline-main flex-grow-1 text-13 px-12 py-8 radius-6"
                      onClick={() => handleViewDetail(teacher)}
                    >
                      <i className="fas fa-eye me-1"></i>
                      Chi tiết
                    </Button>
                    <Button 
                      className="btn-outline-info text-13 px-12 py-8 radius-6"
                      onClick={() => handleEdit(teacher)}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      className="btn-outline-danger text-13 px-12 py-8 radius-6"
                      onClick={() => handleDelete(teacher.id)}
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
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Giảng viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Liên hệ</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Chuyên môn</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Lớp dạy</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Đánh giá</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(teacher => (
                  <tr key={teacher.id}>
                    <td className="px-20 py-16">
                      <div className="d-flex align-items-center gap-12">
                        <div 
                          className="rounded-circle bg-main-100 d-flex align-items-center justify-content-center text-main-600 fw-bold"
                          style={{ width: '40px', height: '40px', fontSize: '16px', minWidth: '40px' }}
                        >
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-neutral-900 fw-semibold text-14">{teacher.name}</div>
                          <div className="text-neutral-500 text-12">{teacher.experience} năm kinh nghiệm</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-20 py-16">
                      <div className="text-neutral-700 text-13 mb-2">{teacher.email}</div>
                      <div className="text-neutral-600 text-12">{teacher.phone}</div>
                    </td>
                    <td className="px-20 py-16">
                      <div className="d-flex flex-wrap gap-4">
                        {teacher.specialization.slice(0, 2).map(spec => (
                          <Badge key={spec} className="bg-main-100 text-main-600 px-8 py-4 text-11">
                            {spec}
                          </Badge>
                        ))}
                        {teacher.specialization.length > 2 && (
                          <Badge className="bg-neutral-100 text-neutral-600 px-8 py-4 text-11">
                            +{teacher.specialization.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-20 py-16 text-center">
                      <span className="text-neutral-900 fw-bold text-14">{teacher.currentClasses}</span>
                      <div className="text-neutral-500 text-11">{teacher.totalStudents} HV</div>
                    </td>
                    <td className="px-20 py-16 text-center">
                      <div className="d-flex gap-2 justify-content-center mb-2">
                        {getRatingStars(teacher.rating)}
                      </div>
                      <div className="text-neutral-600 text-12">{teacher.rating}/5.0</div>
                    </td>
                    <td className="px-20 py-16">{getStatusBadge(teacher.status)}</td>
                    <td className="px-20 py-16">
                      <div className="d-flex gap-8 justify-content-center">
                        <Button 
                          className="btn-outline-main text-12 px-12 py-6 radius-6"
                          onClick={() => handleViewDetail(teacher)}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                        <Button 
                          className="btn-outline-info text-12 px-12 py-6 radius-6"
                          onClick={() => handleEdit(teacher)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          className="btn-outline-danger text-12 px-12 py-6 radius-6"
                          onClick={() => handleDelete(teacher.id)}
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
          <Modal.Title>{editingTeacher ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Nguyễn Văn A"
                    required
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
                  <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0901234567"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Bằng cấp</Form.Label>
                  <Form.Control
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    placeholder="VD: CELTA, Master in English"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Kinh nghiệm (năm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="VD: 5"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Chuyên môn</Form.Label>
                  <div className="border border-neutral-200 rounded-8 p-16">
                    <Row className="g-2">
                      {specializationOptions.map(spec => (
                        <Col md={6} key={spec}>
                          <Form.Check
                            type="checkbox"
                            id={`spec-${spec}`}
                            label={spec}
                            checked={formData.specialization.includes(spec)}
                            onChange={() => handleSpecializationToggle(spec)}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Tạm nghỉ</option>
                  </Form.Select>
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
              {editingTeacher ? 'Cập nhật' : 'Thêm giảng viên'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Teacher Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thông tin giảng viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTeacher && (
            <Tabs defaultActiveKey="profile">
              <Tab eventKey="profile" title="Thông tin">
                <div className="pt-20">
                  <div className="d-flex align-items-center gap-20 mb-24">
                    <div 
                      className="rounded-circle bg-main-100 d-flex align-items-center justify-content-center text-main-600 fw-bold"
                      style={{ width: '80px', height: '80px', fontSize: '32px' }}
                    >
                      {selectedTeacher.name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-neutral-900 fw-bold mb-8">{selectedTeacher.name}</h5>
                      <div className="d-flex gap-4 mb-8">
                        {getRatingStars(selectedTeacher.rating)}
                        <span className="text-neutral-600 text-14 ms-2">{selectedTeacher.rating}/5.0</span>
                      </div>
                      {getStatusBadge(selectedTeacher.status)}
                    </div>
                  </div>

                  <Row className="g-3">
                    <Col md={6}>
                      <div className="bg-neutral-50 rounded-8 p-16">
                        <div className="text-neutral-600 text-12 mb-4">Email</div>
                        <div className="text-neutral-900 text-14">{selectedTeacher.email}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="bg-neutral-50 rounded-8 p-16">
                        <div className="text-neutral-600 text-12 mb-4">Số điện thoại</div>
                        <div className="text-neutral-900 text-14">{selectedTeacher.phone}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="bg-neutral-50 rounded-8 p-16">
                        <div className="text-neutral-600 text-12 mb-4">Bằng cấp</div>
                        <div className="text-neutral-900 text-14">{selectedTeacher.qualifications}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="bg-neutral-50 rounded-8 p-16">
                        <div className="text-neutral-600 text-12 mb-4">Kinh nghiệm</div>
                        <div className="text-neutral-900 text-14">{selectedTeacher.experience} năm</div>
                      </div>
                    </Col>
                    <Col md={12}>
                      <div className="bg-neutral-50 rounded-8 p-16">
                        <div className="text-neutral-600 text-12 mb-8">Chuyên môn</div>
                        <div className="d-flex flex-wrap gap-8">
                          {selectedTeacher.specialization.map(spec => (
                            <Badge key={spec} className="bg-main-600 text-white px-12 py-6">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div className="mt-24">
                    <h6 className="text-neutral-900 fw-semibold mb-16">Thống kê</h6>
                    <Row className="g-3">
                      <Col md={4}>
                        <Card className="bg-main-25 border-0">
                          <Card.Body className="p-16 text-center">
                            <div className="text-main-600 fw-bold text-24 mb-4">{selectedTeacher.currentClasses}</div>
                            <div className="text-neutral-600 text-13">Lớp đang dạy</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="bg-success-25 border-0">
                          <Card.Body className="p-16 text-center">
                            <div className="text-success-600 fw-bold text-24 mb-4">{selectedTeacher.totalStudents}</div>
                            <div className="text-neutral-600 text-13">Học viên</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="bg-warning-25 border-0">
                          <Card.Body className="p-16 text-center">
                            <div className="text-warning-600 fw-bold text-24 mb-4">{selectedTeacher.completedLessons}</div>
                            <div className="text-neutral-600 text-13">Buổi đã dạy</div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Tab>

              <Tab eventKey="classes" title="Lớp đang dạy">
                <div className="pt-20">
                  <Table hover>
                    <thead className="bg-neutral-25">
                      <tr>
                        <th className="px-16 py-12 text-13">Lớp học</th>
                        <th className="px-16 py-12 text-13">Level</th>
                        <th className="px-16 py-12 text-13">Học viên</th>
                        <th className="px-16 py-12 text-13">Tiến độ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-16 py-12">A2-Evening-01</td>
                        <td className="px-16 py-12">
                          <Badge className="bg-main-100 text-main-600">A2</Badge>
                        </td>
                        <td className="px-16 py-12">25 HV</td>
                        <td className="px-16 py-12">
                          <div className="d-flex align-items-center gap-12">
                            <ProgressBar 
                              now={65} 
                              style={{ height: '6px', width: '100px' }}
                              className="flex-grow-1"
                            />
                            <span className="text-13">65%</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Tab>

              <Tab eventKey="schedule" title="Lịch dạy">
                <div className="pt-20">
                  <Table hover>
                    <thead className="bg-neutral-25">
                      <tr>
                        <th className="px-16 py-12 text-13">Thời gian</th>
                        <th className="px-16 py-12 text-13">Lớp học</th>
                        <th className="px-16 py-12 text-13">Phòng</th>
                        <th className="px-16 py-12 text-13">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-16 py-12">Thứ 2, 4, 6 - 18:00-20:00</td>
                        <td className="px-16 py-12">A2-Evening-01</td>
                        <td className="px-16 py-12">Room 102</td>
                        <td className="px-16 py-12">
                          <Badge className="bg-success-600 text-white">Đang dạy</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-outline-neutral" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherManagement;
