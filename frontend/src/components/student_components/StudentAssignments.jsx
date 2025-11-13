import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, ButtonGroup, Table } from 'react-bootstrap';

/**
 * Student Assignments Component
 * Quản lý bài tập của học viên
 */
const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // TODO: Replace with actual API call
      const mockData = [
        {
          id: 1,
          title: 'Unit 6 - Grammar Exercise',
          description: 'Complete exercises 1-10 on page 45',
          className: 'A2-Evening-01',
          dueDate: '2025-11-05',
          status: 'pending',
          priority: 'high',
          score: null,
          submittedDate: null
        },
        {
          id: 2,
          title: 'Reading Comprehension Test',
          description: 'Read the passage and answer questions',
          className: 'A2-Evening-01',
          dueDate: '2025-11-07',
          status: 'pending',
          priority: 'medium',
          score: null,
          submittedDate: null
        },
        {
          id: 3,
          title: 'IELTS Writing Task 2',
          description: 'Write an essay about education',
          className: 'IELTS-Writing-03',
          dueDate: '2025-11-06',
          status: 'pending',
          priority: 'high',
          score: null,
          submittedDate: null
        },
        {
          id: 4,
          title: 'Unit 5 - Writing Assignment',
          description: 'Write a short paragraph about your daily routine',
          className: 'A2-Evening-01',
          dueDate: '2025-10-30',
          status: 'graded',
          priority: 'medium',
          score: 9,
          submittedDate: '2025-10-29'
        },
        {
          id: 5,
          title: 'Listening Practice Exercise',
          description: 'Listen and complete the exercises',
          className: 'A2-Evening-01',
          dueDate: '2025-10-28',
          status: 'submitted',
          priority: 'low',
          score: null,
          submittedDate: '2025-10-27'
        }
      ];
      setAssignments(mockData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-warning-600', text: 'Chưa nộp', icon: 'fa-clock' },
      submitted: { bg: 'bg-info-500', text: 'Đã nộp', icon: 'fa-check' },
      graded: { bg: 'bg-success-600', text: 'Đã chấm', icon: 'fa-star' },
      late: { bg: 'bg-danger-600', text: 'Quá hạn', icon: 'fa-exclamation-triangle' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.bg} text-white px-12 py-6 text-12`}>
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { bg: 'bg-danger-100', text: 'text-danger-600', label: 'Cao' },
      medium: { bg: 'bg-warning-100', text: 'text-warning-600', label: 'Trung bình' },
      low: { bg: 'bg-info-100', text: 'text-info-500', label: 'Thấp' }
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <Badge className={`${config.bg} ${config.text} px-12 py-6 text-12`}>
        {config.label}
      </Badge>
    );
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const classes = [...new Set(assignments.map(a => a.className))];

  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchesClass = filterClass === 'all' || assignment.className === filterClass;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesClass && matchesSearch;
  });

  const renderGridView = () => (
    <Row className="g-3">
      {filteredAssignments.map(assignment => {
        const daysRemaining = getDaysRemaining(assignment.dueDate);
        const isOverdue = daysRemaining < 0 && assignment.status === 'pending';

        return (
          <Col key={assignment.id} md={6} lg={4}>
            <Card className="bg-white border-0 rounded-12 transition- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}2 item-hover h-100">
              <Card.Body className="p-20">
                <div className="d-flex justify-content-between align-items-start mb-12">
                  {getStatusBadge(isOverdue ? 'late' : assignment.status)}
                  {getPriorityBadge(assignment.priority)}
                </div>

                <h6 className="text-neutral-900 fw-bold mb-8">{assignment.title}</h6>
                <p className="text-neutral-600 text-13 mb-12" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {assignment.description}
                </p>

                <div className="bg-main-25 border border-main-100 rounded-8 p-12 mb-12">
                  <div className="text-neutral-500 text-12 mb-4">Lớp học</div>
                  <div className="text-neutral-900 fw-medium text-13">{assignment.className}</div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-16 pb-16 border-bottom border-neutral-100">
                  <div>
                    <div className="text-neutral-500 text-12 mb-4">Hạn nộp</div>
                    <div className="text-neutral-900 fw-medium text-13">
                      {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  {assignment.status === 'pending' && !isOverdue && (
                    <div className="text-center">
                      <div className={`fw-bold text-18 ${daysRemaining <= 2 ? 'text-danger-600' : 'text-warning-600'}`}>
                        {daysRemaining}
                      </div>
                      <div className="text-neutral-500 text-11">ngày</div>
                    </div>
                  )}
                </div>

                {assignment.status === 'graded' && (
                  <div className="bg-success-50 border border-success-200 rounded-8 p-12 mb-12">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-neutral-700 text-13">Điểm số</span>
                      <span className="text-success-600 fw-bold text-16">{assignment.score}/10</span>
                    </div>
                  </div>
                )}

                {assignment.status === 'submitted' && (
                  <div className="text-neutral-500 text-12 mb-12">
                    <i className="fas fa-check-circle text-info-500 me-1"></i>
                    Đã nộp: {new Date(assignment.submittedDate).toLocaleDateString('vi-VN')}
                  </div>
                )}

                <Button 
                  className={`w-100 text-13 fw-semibold py-10 radius-8 ${
                    assignment.status === 'pending' ? 'btn-main' : 'btn-outline-main'
                  }`}
                >
                  {assignment.status === 'pending' && <><i className="fas fa-upload me-2"></i>Nộp bài</>}
                  {assignment.status === 'submitted' && <><i className="fas fa-eye me-2"></i>Xem bài nộp</>}
                  {assignment.status === 'graded' && <><i className="fas fa-file-download me-2"></i>Xem chi tiết</>}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  const renderListView = () => (
    <Card className="bg-white border-0 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
      <Card.Body className="p-0">
        <Table hover className="mb-0">
          <thead>
            <tr className="bg-main-25">
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Bài tập</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Lớp học</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Hạn nộp</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Ưu tiên</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Điểm</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.map(assignment => {
              const daysRemaining = getDaysRemaining(assignment.dueDate);
              const isOverdue = daysRemaining < 0 && assignment.status === 'pending';

              return (
                <tr key={assignment.id}>
                  <td className="px-20 py-16">
                    <div className="text-neutral-900 fw-medium text-13 mb-4">{assignment.title}</div>
                    <div className="text-neutral-500 text-12">{assignment.description}</div>
                  </td>
                  <td className="px-20 py-16 text-neutral-700 text-13">{assignment.className}</td>
                  <td className="px-20 py-16">
                    <div className="text-neutral-700 text-13 mb-4">
                      {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                    </div>
                    {assignment.status === 'pending' && !isOverdue && (
                      <div className={`text-12 ${daysRemaining <= 2 ? 'text-danger-600' : 'text-warning-600'}`}>
                        Còn {daysRemaining} ngày
                      </div>
                    )}
                  </td>
                  <td className="px-20 py-16">{getPriorityBadge(assignment.priority)}</td>
                  <td className="px-20 py-16">{getStatusBadge(isOverdue ? 'late' : assignment.status)}</td>
                  <td className="px-20 py-16">
                    {assignment.score && (
                      <Badge className="bg-success-600 text-white px-12 py-6">
                        {assignment.score}/10
                      </Badge>
                    )}
                  </td>
                  <td className="px-20 py-16 text-center">
                    <Button 
                      className={`text-13 fw-medium px-16 py-8 radius-8 ${
                        assignment.status === 'pending' ? 'btn-main' : 'btn-outline-main'
                      }`}
                    >
                      {assignment.status === 'pending' && <><i className="fas fa-upload me-1"></i>Nộp</>}
                      {assignment.status === 'submitted' && <><i className="fas fa-eye me-1"></i>Xem</>}
                      {assignment.status === 'graded' && <><i className="fas fa-file-download me-1"></i>Chi tiết</>}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="py-24 px-24">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h3 className="text-neutral-900 fw-bold mb-8">Bài tập của tôi</h3>
          <p className="text-neutral-500 mb-0">Quản lý và nộp bài tập</p>
        </div>
      </div>

      {/* Summary Stats */}
      <Row className="g-3 mb-24">
        <Col md={3}>
          <Card className="bg-warning-25 border border-warning-200 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
            <Card.Body className="p-20">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-warning-600 text-24 fw-bold">
                    {assignments.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="text-neutral-700 text-13">Chưa nộp</div>
                </div>
                <div className="bg-warning-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-clock"></i>
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
                    {assignments.filter(a => a.status === 'submitted').length}
                  </div>
                  <div className="text-neutral-700 text-13">Đã nộp</div>
                </div>
                <div className="bg-info-500 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-check"></i>
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
                    {assignments.filter(a => a.status === 'graded').length}
                  </div>
                  <div className="text-neutral-700 text-13">Đã chấm</div>
                </div>
                <div className="bg-success-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-star"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-main-25 border border-main-200 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
            <Card.Body className="p-20">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-main-600 text-24 fw-bold">
                    {Math.round(
                      assignments.filter(a => a.score).reduce((sum, a) => sum + a.score, 0) /
                      assignments.filter(a => a.score).length * 10
                    ) / 10 || 0}
                  </div>
                  <div className="text-neutral-700 text-13">Điểm TB</div>
                </div>
                <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="bg-white border-0 rounded-12 mb- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}24">
        <Card.Body className="p-20">
          <Row className="align-items-center">
            <Col lg={4}>
              <Form.Group>
                <div className="position-relative">
                  <i className="fas fa-search position-absolute text-neutral-500"
                     style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }}></i>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm bài tập..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-neutral-30 radius-8 ps-40 py-10 text-13"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col lg={3}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border-neutral-30 radius-8 px-16 py-10 text-13"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chưa nộp</option>
                <option value="submitted">Đã nộp</option>
                <option value="graded">Đã chấm</option>
              </Form.Select>
            </Col>
            <Col lg={3}>
              <Form.Select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="border-neutral-30 radius-8 px-16 py-10 text-13"
              >
                <option value="all">Tất cả lớp học</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={2}>
              <ButtonGroup className="w-100">
                <Button
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'btn-main' : 'btn-outline-main'}
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  <i className="fas fa-th-large"></i>
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'btn-main' : 'btn-outline-main'}
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  <i className="fas fa-list"></i>
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Content */}
      {filteredAssignments.length > 0 ? (
        viewMode === 'grid' ? renderGridView() : renderListView()
      ) : (
        <Card className="bg-white border-0 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
          <Card.Body className="text-center py-60">
            <i className="fas fa-tasks fa-4x text-neutral-400 mb-20"></i>
            <h5 className="text-neutral-700 fw-semibold mb-8">Không tìm thấy bài tập nào</h5>
            <p className="text-neutral-500 mb-0">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default StudentAssignments;
