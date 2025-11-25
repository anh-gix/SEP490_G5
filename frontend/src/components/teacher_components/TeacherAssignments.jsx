import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal } from 'react-bootstrap';
import { teacherAssignmentsMock } from './teacher_mockdata';

/**
 * Teacher Assignments Component
 * Quản lý bài tập - giao bài, xem submissions
 */
const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  React.useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    // TODO: Replace with actual API call
    // const response = await teacherAPI.getAssignments();
    // setAssignments(response.data);
    
    // Using mock data
    setAssignments(teacherAssignmentsMock);
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (assignment.graded === assignment.totalStudents) {
      return <Badge className="bg-success-600 text-white px-12 py-6">Đã chấm xong</Badge>;
    }
    if (now > dueDate) {
      return <Badge className="bg-danger-600 text-white px-12 py-6">Quá hạn</Badge>;
    }
    return <Badge className="bg-main-600 text-white px-12 py-6">Đang mở</Badge>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      homework: { bg: 'bg-info-100', text: 'text-info-600', label: 'Bài tập' },
      practice: { bg: 'bg-warning-100', text: 'text-warning-600', label: 'Luyện tập' },
      test: { bg: 'bg-danger-100', text: 'text-danger-600', label: 'Kiểm tra' }
    };
    const config = typeConfig[type] || typeConfig.homework;
    return <Badge className={`${config.bg} ${config.text} px-12 py-6`}>{config.label}</Badge>;
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesClass = filterClass === 'all' || a.classId === parseInt(filterClass);
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesClass && matchesStatus;
  });

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Quản lý Bài tập</h4>
          <p className="text-neutral-600 mb-0">Tạo và quản lý bài tập cho học viên</p>
        </div>
        <Button 
          className="btn-main px-20 py-12 radius-8"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Tạo bài tập mới
        </Button>
      </div>

      {/* Summary Stats */}
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
                    background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)'
                  }}
                >
                  <i className="fas fa-tasks text-main-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng bài tập</div>
                  <div className="text-neutral-900 fw-bold text-32">{assignments.length}</div>
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
                    background: 'linear-gradient(135deg, #FFF4E6 0%, #FFE8CC 100%)'
                  }}
                >
                  <i className="fas fa-clock text-warning-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Chờ nộp</div>
                  <div className="text-neutral-900 fw-bold text-32">
                    {assignments.reduce((sum, a) => sum + (a.totalStudents - a.submitted), 0)}
                  </div>
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
                    background: 'linear-gradient(135deg, #FFF0F0 0%, #FFE6E6 100%)'
                  }}
                >
                  <i className="fas fa-file-alt text-danger-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Chờ chấm</div>
                  <div className="text-neutral-900 fw-bold text-32">
                    {assignments.reduce((sum, a) => sum + (a.submitted - a.graded), 0)}
                  </div>
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
                    background: 'linear-gradient(135deg, #F0FFF4 0%, #E6FFED 100%)'
                  }}
                >
                  <i className="fas fa-check-circle text-success-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Đã chấm</div>
                  <div className="text-neutral-900 fw-bold text-32">
                    {assignments.reduce((sum, a) => sum + a.graded, 0)}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-20">
          <Row className="g-3">
            <Col md={4}>
              <Form.Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="radius-8">
                <option value="all">Tất cả lớp học</option>
                <option value="1">A2-Evening-01</option>
                <option value="2">B1-Afternoon-02</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="radius-8">
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang mở</option>
                <option value="closed">Đã đóng</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Assignments Table */}
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
        <Card.Body className="p-0">
          <Table hover className="mb-0">
            <thead>
              <tr className="bg-neutral-25">
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Bài tập</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Lớp học</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Loại</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Hạn nộp</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Đã nộp</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Đã chấm</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map(assignment => (
                <tr key={assignment.id}>
                  <td className="px-20 py-16">
                    <div className="text-neutral-900 fw-semibold text-14">{assignment.title}</div>
                    <div className="text-neutral-500 text-12">
                      Tạo: {new Date(assignment.createdDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-20 py-16 text-neutral-700 text-13">{assignment.className}</td>
                  <td className="px-20 py-16">{getTypeBadge(assignment.type)}</td>
                  <td className="px-20 py-16 text-neutral-700 text-13">
                    {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-20 py-16">
                    <div className="text-neutral-900 fw-medium text-13">
                      {assignment.submitted}/{assignment.totalStudents}
                    </div>
                    <div className="text-neutral-500 text-11">
                      ({Math.round((assignment.submitted / assignment.totalStudents) * 100)}%)
                    </div>
                  </td>
                  <td className="px-20 py-16">
                    <div className="text-neutral-900 fw-medium text-13">
                      {assignment.graded}/{assignment.submitted}
                    </div>
                    <div className="text-neutral-500 text-11">
                      ({assignment.submitted > 0 ? Math.round((assignment.graded / assignment.submitted) * 100) : 0}%)
                    </div>
                  </td>
                  <td className="px-20 py-16">{getStatusBadge(assignment)}</td>
                  <td className="px-20 py-16 text-center">
                    <div className="d-flex gap-8 justify-content-center">
                      <Button 
                        className="btn-outline-main text-13 px-12 py-6 radius-6"
                      >
                        <i className="fas fa-eye me-1"></i>
                        Xem
                      </Button>
                      {assignment.submitted > assignment.graded && (
                        <Button className="btn-warning text-13 px-12 py-6 radius-6">
                          <i className="fas fa-pen me-1"></i>
                          Chấm ({assignment.submitted - assignment.graded})
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create Assignment Modal - Simple placeholder */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tạo bài tập mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-16">
              <Form.Label>Tên bài tập</Form.Label>
              <Form.Control type="text" placeholder="VD: Unit 5 - Grammar Exercise" />
            </Form.Group>
            <Form.Group className="mb-16">
              <Form.Label>Lớp học</Form.Label>
              <Form.Select>
                <option>Chọn lớp học</option>
                <option>A2-Evening-01</option>
                <option>B1-Afternoon-02</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-16">
              <Form.Label>Loại bài tập</Form.Label>
              <Form.Select>
                <option value="homework">Bài tập về nhà</option>
                <option value="practice">Luyện tập</option>
                <option value="test">Kiểm tra</option>
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-16">
                  <Form.Label>Ngày bắt đầu</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-16">
                  <Form.Label>Hạn nộp</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-16">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Mô tả chi tiết bài tập..." />
            </Form.Group>
            <Form.Group className="mb-16">
              <Form.Label>File đính kèm</Form.Label>
              <Form.Control type="file" multiple />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-outline-neutral" onClick={() => setShowCreateModal(false)}>
            Hủy
          </Button>
          <Button className="btn-main">
            <i className="fas fa-save me-2"></i>
            Tạo bài tập
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherAssignments;
