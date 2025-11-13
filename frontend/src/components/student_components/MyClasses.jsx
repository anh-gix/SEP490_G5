import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, ProgressBar, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * My Classes Component
 * Hiển thị danh sách các lớp học mà học viên đã đăng ký
 */
const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    try {
      // TODO: Replace with actual API call
      // Mock data
      const mockData = [
        {
          id: 1,
          name: 'A2-Evening-01',
          level: 'A2',
          teacher: 'Trần Thị B',
          schedule: 'Thứ 2, 4, 6 | 18:00 - 20:00',
          startDate: '2025-09-01',
          endDate: '2025-11-30',
          totalLessons: 30,
          completedLessons: 18,
          nextLesson: {
            date: '2025-11-03',
            topic: 'Present Perfect Tense'
          },
          pendingAssignments: 2,
          attendanceRate: 92,
          averageScore: 8.5,
          status: 'active',
          thumbnail: null
        },
        {
          id: 2,
          name: 'IELTS-Writing-03',
          level: 'IELTS',
          teacher: 'Nguyễn Văn C',
          schedule: 'Thứ 3, 5 | 19:00 - 21:00',
          startDate: '2025-10-01',
          endDate: '2025-12-20',
          totalLessons: 20,
          completedLessons: 8,
          nextLesson: {
            date: '2025-11-05',
            topic: 'Task 2 Essay Structure'
          },
          pendingAssignments: 1,
          attendanceRate: 100,
          averageScore: 7.8,
          status: 'active',
          thumbnail: null
        },
        {
          id: 3,
          name: 'A1-Morning-02',
          level: 'A1',
          teacher: 'Lê Thị D',
          schedule: 'Thứ 2, 4 | 09:00 - 11:00',
          startDate: '2025-06-01',
          endDate: '2025-08-30',
          totalLessons: 24,
          completedLessons: 24,
          nextLesson: null,
          pendingAssignments: 0,
          attendanceRate: 95,
          averageScore: 8.2,
          status: 'completed',
          thumbnail: null
        }
      ];
      setClasses(mockData);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-success-600', text: 'Đang học', icon: 'fa-play-circle' },
      completed: { bg: 'bg-neutral-600', text: 'Đã hoàn thành', icon: 'fa-check-circle' },
      paused: { bg: 'bg-warning-600', text: 'Tạm dừng', icon: 'fa-pause-circle' },
      cancelled: { bg: 'bg-danger-600', text: 'Đã hủy', icon: 'fa-times-circle' }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge className={`${config.bg} text-white px-12 py-6 text-12`}>
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };

  const filteredClasses = classes.filter(cls => {
    const matchesStatus = filterStatus === 'all' || cls.status === filterStatus;
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const renderGridView = () => {
    return (
      <Row className="g-3">
        {filteredClasses.map(cls => {
          const progress = Math.round((cls.completedLessons / cls.totalLessons) * 100);
          
          return (
            <Col key={cls.id} md={6} lg={4}>
              <Card className="bg-white border-0 rounded-12 transition- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}2 item-hover h-100">
                {/* Card Header with Image/Color */}
                <div 
                  className="bg-gradient p-24 rounded-top-12"
                  style={{ 
                    background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)',
                    minHeight: '120px'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <Badge className="bg-white text-main-600 px-12 py-6 text-13 fw-semibold">
                      {cls.level}
                    </Badge>
                    {getStatusBadge(cls.status)}
                  </div>
                  <h5 className="fw-bold mt-12 mb-0">{cls.name}</h5>
                </div>

                <Card.Body className="p-20">
                  {/* Teacher Info */}
                  <div className="d-flex align-items-center gap-8 mb-16 pb-16 border-bottom border-neutral-100">
                    <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                         style={{ width: '36px', height: '36px', minWidth: '36px' }}>
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-12">Giảng viên</div>
                      <div className="text-neutral-900 fw-semibold text-14">{cls.teacher}</div>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="mb-16">
                    <div className="d-flex align-items-center gap-8 mb-8">
                      <i className="fas fa-calendar-alt text-neutral-500"></i>
                      <span className="text-neutral-700 text-13">{cls.schedule}</span>
                    </div>
                    <div className="d-flex align-items-center gap-8">
                      <i className="fas fa-clock text-neutral-500"></i>
                      <span className="text-neutral-700 text-13">
                        {new Date(cls.startDate).toLocaleDateString('vi-VN')} - {new Date(cls.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-16">
                    <div className="d-flex justify-content-between align-items-center mb-8">
                      <span className="text-neutral-700 text-13 fw-medium">Tiến độ học tập</span>
                      <span className="text-main-600 fw-bold text-13">{progress}%</span>
                    </div>
                    <div 
                      className="bg-neutral-200 rounded-pill overflow-hidden"
                      style={{ height: '8px' }}
                    >
                      <div 
                        className="bg-main-600 h-100 transition-2"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-neutral-500 text-12 mt-4">
                      {cls.completedLessons}/{cls.totalLessons} buổi học
                    </div>
                  </div>

                  {/* Stats */}
                  <Row className="g-2 mb-16">
                    <Col xs={6}>
                      <div className="bg-success-25 border border-success-100 rounded-8 p-12 text-center">
                        <div className="text-success-600 fw-bold text-16">{cls.attendanceRate}%</div>
                        <div className="text-neutral-600 text-11">Chuyên cần</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-warning-25 border border-warning-100 rounded-8 p-12 text-center">
                        <div className="text-warning-600 fw-bold text-16">{cls.averageScore}</div>
                        <div className="text-neutral-600 text-11">Điểm TB</div>
                      </div>
                    </Col>
                  </Row>

                  {/* Next Lesson */}
                  {cls.nextLesson && (
                    <div className="bg-info-25 border border-info-100 rounded-8 p-12 mb-16">
                      <div className="text-neutral-700 text-12 mb-4">
                        <i className="fas fa-calendar-check text-info-500 me-1"></i>
                        Buổi học tiếp theo
                      </div>
                      <div className="text-neutral-900 fw-medium text-13">
                        {cls.nextLesson.topic}
                      </div>
                      <div className="text-neutral-500 text-12 mt-2">
                        {new Date(cls.nextLesson.date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  )}

                  {/* Pending Assignments Badge */}
                  {cls.pendingAssignments > 0 && (
                    <div className="bg-warning-50 border border-warning-200 rounded-8 p-12 mb-16">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="text-neutral-700 text-13">
                          <i className="fas fa-tasks text-warning-600 me-2"></i>
                          Bài tập chưa nộp
                        </span>
                        <Badge className="bg-warning-600 text-white">{cls.pendingAssignments}</Badge>
                      </div>
                    </div>
                  )}
                </Card.Body>

                {/* Card Footer */}
                <Card.Footer className="bg-neutral-25 border-0 p-16">
                  <Link to={`/student/class/${cls.id}`} className="text-decoration-none">
                    <Button className="btn-main text-13 fw-semibold w-100 py-10 radius-8">
                      <i className="fas fa-arrow-right me-2"></i>
                      Vào lớp học
                    </Button>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          );
        })}

        {filteredClasses.length === 0 && (
          <Col xs={12}>
            <Card className="bg-white border-0 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
              <Card.Body className="text-center py-60">
                <i className="fas fa-book-open fa-4x text-neutral-400 mb-20"></i>
                <h5 className="text-neutral-700 fw-semibold mb-8">Không tìm thấy lớp học nào</h5>
                <p className="text-neutral-500 mb-0">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    );
  };

  const renderListView = () => {
    return (
      <div className="d-flex flex-column gap-3">
        {filteredClasses.map(cls => {
          const progress = Math.round((cls.completedLessons / cls.totalLessons) * 100);
          
          return (
            <Card key={cls.id} className="bg-white border-0 rounded-12 transition- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}2 item-hover">
              <Card.Body className="p-20">
                <Row className="align-items-center">
                  {/* Class Info */}
                  <Col md={4}>
                    <div className="d-flex align-items-center gap-12">
                      <div 
                        className="bg-gradient rounded-12 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '80px',
                          height: '80px',
                          minWidth: '80px',
                          background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
                        }}
                      >
                        <div className="text-center">
                          <div className="text-white fw-bold text-18">{cls.level}</div>
                        </div>
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-8 mb-4">
                          <h6 className="text-neutral-900 fw-bold mb-0">{cls.name}</h6>
                          {getStatusBadge(cls.status)}
                        </div>
                        <div className="text-neutral-500 text-13 mb-2">
                          <i className="fas fa-user me-1"></i>
                          {cls.teacher}
                        </div>
                        <div className="text-neutral-500 text-12">
                          <i className="fas fa-calendar-alt me-1"></i>
                          {cls.schedule}
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* Progress & Stats */}
                  <Col md={4}>
                    <div className="mb-12">
                      <div className="d-flex justify-content-between align-items-center mb-8">
                        <span className="text-neutral-700 text-13 fw-medium">Tiến độ</span>
                        <span className="text-main-600 fw-bold text-13">{progress}%</span>
                      </div>
                      <div 
                        className="bg-neutral-200 rounded-pill overflow-hidden"
                        style={{ height: '8px' }}
                      >
                        <div 
                          className="bg-main-600 h-100 transition-2"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-neutral-500 text-12 mt-4">
                        {cls.completedLessons}/{cls.totalLessons} buổi học
                      </div>
                    </div>

                    <div className="d-flex gap-12">
                      <div className="flex-fill bg-success-25 border border-success-100 rounded-8 p-8 text-center">
                        <div className="text-success-600 fw-bold text-14">{cls.attendanceRate}%</div>
                        <div className="text-neutral-600 text-11">Chuyên cần</div>
                      </div>
                      <div className="flex-fill bg-warning-25 border border-warning-100 rounded-8 p-8 text-center">
                        <div className="text-warning-600 fw-bold text-14">{cls.averageScore}</div>
                        <div className="text-neutral-600 text-11">Điểm TB</div>
                      </div>
                      {cls.pendingAssignments > 0 && (
                        <div className="flex-fill bg-danger-25 border border-danger-100 rounded-8 p-8 text-center">
                          <div className="text-danger-600 fw-bold text-14">{cls.pendingAssignments}</div>
                          <div className="text-neutral-600 text-11">Bài tập</div>
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Next Lesson & Action */}
                  <Col md={4}>
                    {cls.nextLesson && (
                      <div className="bg-info-25 border border-info-100 rounded-8 p-12 mb-12">
                        <div className="text-neutral-700 text-12 mb-4">
                          <i className="fas fa-calendar-check text-info-500 me-1"></i>
                          Buổi học tiếp theo
                        </div>
                        <div className="text-neutral-900 fw-medium text-13 mb-2">
                          {cls.nextLesson.topic}
                        </div>
                        <div className="text-neutral-500 text-12">
                          {new Date(cls.nextLesson.date).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    )}
                    <Link to={`/student/class/${cls.id}`} className="text-decoration-none">
                      <Button className="btn-main text-13 fw-semibold w-100 py-10 radius-8">
                        <i className="fas fa-arrow-right me-2"></i>
                        Vào lớp học
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}

        {filteredClasses.length === 0 && (
          <Card className="bg-white border-0 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
            <Card.Body className="text-center py-60">
              <i className="fas fa-book-open fa-4x text-neutral-400 mb-20"></i>
              <h5 className="text-neutral-700 fw-semibold mb-8">Không tìm thấy lớp học nào</h5>
              <p className="text-neutral-500 mb-0">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </Card.Body>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Container fluid className="py-24 px-24">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h3 className="text-neutral-900 fw-bold mb-8">Lớp học của tôi</h3>
          <p className="text-neutral-500 mb-0">Quản lý và theo dõi tiến độ các lớp học đã đăng ký</p>
        </div>
      </div>

      {/* Filters & Controls */}
      <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Body className="p-20">
          <Row className="align-items-center">
            <Col lg={4}>
              {/* Search */}
              <Form.Group>
                <div className="position-relative">
                  <i className="fas fa-search position-absolute text-neutral-500"
                     style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }}></i>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm lớp học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-neutral-30 radius-8 ps-40 py-10 text-13"
                  />
                </div>
              </Form.Group>
            </Col>

            <Col lg={4}>
              {/* Filter by Status */}
              <Form.Group>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border-neutral-30 radius-8 px-16 py-10 text-13"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang học</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="paused">Tạm dừng</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col lg={4}>
              {/* View Toggle */}
              <div className="d-flex justify-content-end">
                <ButtonGroup>
                  <Button
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'btn-main' : 'btn-outline-main'}
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    <i className="fas fa-th-large me-2"></i>
                    Lưới
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'btn-main' : 'btn-outline-main'}
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    <i className="fas fa-list me-2"></i>
                    Danh sách
                  </Button>
                </ButtonGroup>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Summary Stats */}
      <Row className="g-3 mb-24">
        <Col md={3}>
          <Card className="bg-main-25 border border-main-200 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
            <Card.Body className="p-20">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-main-600 text-24 fw-bold">
                    {classes.filter(c => c.status === 'active').length}
                  </div>
                  <div className="text-neutral-700 text-13">Lớp đang học</div>
                </div>
                <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-play-circle"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success-25 border border-success-200 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
            <Card.Body className="p-20">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-success-600 text-24 fw-bold">
                    {classes.filter(c => c.status === 'completed').length}
                  </div>
                  <div className="text-neutral-700 text-13">Đã hoàn thành</div>
                </div>
                <div className="bg-success-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-warning-25 border border-warning-200 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
            <Card.Body className="p-20">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-warning-600 text-24 fw-bold">
                    {classes.reduce((sum, c) => sum + c.pendingAssignments, 0)}
                  </div>
                  <div className="text-neutral-700 text-13">Bài tập chưa nộp</div>
                </div>
                <div className="bg-warning-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-tasks"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-info-25 border border-info-200 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
            <Card.Body className="p-20">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-info-500 text-24 fw-bold">
                    {Math.round(classes.reduce((sum, c) => sum + c.averageScore, 0) / classes.length * 10) / 10 || 0}
                  </div>
                  <div className="text-neutral-700 text-13">Điểm TB chung</div>
                </div>
                <div className="bg-info-500 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-star"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Classes Content */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}
    </Container>
  );
};

export default MyClasses;
