import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal } from 'react-bootstrap';
import homeworkService from '../../services/homeworkService';
import CreateHomeworkModal from './class_detail/modals/CreateHomeworkModal';

/**
 * Teacher Assignments Component
 * Quản lý bài tập - giao bài, xem submissions
 */
const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  // const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // setLoading(true);
      const response = await homeworkService.getTeacherAssignments();
      
      if (response.success) {
        setAssignments(response.assignments || []);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      // setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchAssignments(); // Reload assignments
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    
    if (assignment.submitted === assignment.totalStudents) {
      return <Badge className="bg-success-600 text-white px-12 py-6">Đã nộp đủ</Badge>;
    }
    if (now > deadline) {
      return <Badge className="bg-danger-600 text-white px-12 py-6">Quá hạn</Badge>;
    }
    return <Badge className="bg-main-600 text-white px-12 py-6">Đang mở</Badge>;
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesClass = filterClass === 'all' || a.className?.includes(filterClass);
    return matchesClass;
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
                  {/* <td className="px-20 py-16">{getTypeBadge(assignment.type)}</td> */}
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

      {/* Create Homework Modal */}
      <CreateHomeworkModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
};

export default TeacherAssignments;
