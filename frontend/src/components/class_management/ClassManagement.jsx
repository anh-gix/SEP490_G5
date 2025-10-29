import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col, Badge, ButtonGroup } from 'react-bootstrap';
import ClassList from './ClassList';
import CreateClassModal from './CreateClassModal';
import EditClassModal from './EditClassModal';
import ClassDetails from './ClassDetails';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    level: '',
    status: '',
    search: ''
  });

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes?' + new URLSearchParams(filters));
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Mock data
      setClasses([
        {
          id: 1,
          name: 'A1-Morning-01',
          level: 'A1',
          program: 'Tiếng Anh Giao tiếp',
          band: 'Band 1',
          status: 'active',
          startDate: '2025-01-15',
          endDate: '2025-04-15',
          schedule: 'T2-4-6, 8:00-10:00',
          teacherId: 1,
          teacherName: 'Nguyễn Văn A',
          roomId: 1,
          roomName: 'Room 101',
          totalStudents: 20,
          maxStudents: 25,
          currentLesson: 5,
          totalLessons: 30,
          completionRate: 16.67
        },
        {
          id: 2,
          name: 'A2-Evening-01',
          level: 'A2',
          program: 'Tiếng Anh Giao tiếp',
          band: 'Band 2',
          status: 'active',
          startDate: '2025-02-01',
          endDate: '2025-05-01',
          schedule: 'T3-5-7, 18:00-20:00',
          teacherId: 2,
          teacherName: 'Trần Thị B',
          roomId: 2,
          roomName: 'Room 102',
          totalStudents: 18,
          maxStudents: 25,
          currentLesson: 8,
          totalLessons: 30,
          completionRate: 26.67
        },
        {
          id: 3,
          name: 'B1-Weekend-01',
          level: 'B1',
          program: 'Tiếng Anh Giao tiếp',
          band: 'Band 3',
          status: 'pending',
          startDate: '2025-11-01',
          endDate: '2026-02-01',
          schedule: 'T7-CN, 9:00-12:00',
          teacherId: 3,
          teacherName: 'Lê Văn C',
          roomId: 3,
          roomName: 'Room 201',
          totalStudents: 15,
          maxStudents: 20,
          currentLesson: 0,
          totalLessons: 40,
          completionRate: 0
        }
      ]);
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCreateClass = async (classData) => {
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      const newClass = await response.json();
      setClasses([...classes, newClass]);
      setShowCreateModal(false);
      alert('Tạo lớp học thành công!');
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Có lỗi xảy ra khi tạo lớp học!');
    }
  };

  const handleEditClass = async (classData) => {
    try {
      const response = await fetch(`/api/classes/${classData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      const updatedClass = await response.json();
      setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
      setShowEditModal(false);
      setSelectedClass(null);
      alert('Cập nhật lớp học thành công!');
      fetchClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Có lỗi xảy ra khi cập nhật lớp học!');
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
    
    try {
      await fetch(`/api/classes/${classId}`, { method: 'DELETE' });
      setClasses(classes.filter(c => c.id !== classId));
      alert('Xóa lớp học thành công!');
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Có lỗi xảy ra khi xóa lớp học!');
    }
  };

  const handleViewDetails = (classItem) => {
    setSelectedClass(classItem);
    setShowDetails(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      level: '',
      status: '',
      search: ''
    });
  };

  return (
    <Container fluid className="py-24 px-24">
      {/* Header */}
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-24">
          <Row className="align-items-center">
            <Col>
              <h2 className="text-neutral-900 fw-bold mb-8">Quản lý lớp học</h2>
              <p className="text-neutral-500 mb-0">Tạo và quản lý thông tin các lớp học</p>
            </Col>
            <Col xs="auto">
              <Button 
                className="btn-main text-15 fw-semibold px-24 py-12 radius-8"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Tạo lớp mới
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Filters */}
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-24">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8">Tìm kiếm</Form.Label>
                <Form.Control
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Tên lớp, giáo trình..."
                  className="border-neutral-30 radius-8 px-16 py-10 text-15"
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8">Cấp độ</Form.Label>
                <Form.Select 
                  name="level" 
                  value={filters.level} 
                  onChange={handleFilterChange}
                  className="border-neutral-30 radius-8 px-16 py-10 text-15"
                >
                  <option value="">Tất cả</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="TOEIC">TOEIC</option>
                  <option value="IELTS">IELTS</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8">Trạng thái</Form.Label>
                <Form.Select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange}
                  className="border-neutral-30 radius-8 px-16 py-10 text-15"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Chờ khai giảng</option>
                  <option value="active">Đang học</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Button 
                className="btn-outline-main w-100 text-15 fw-medium px-16 py-10 radius-8"
                onClick={handleResetFilters}
              >
                <i className="fas fa-redo me-2"></i>
                Đặt lại
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats */}
      <Row className="g-3 mb-24">
        <Col md={6} lg={3}>
          <Card className="bg-white border border-main-200 rounded-12 box-shadow-sm transition-2 item-hover">
            <Card.Body className="d-flex align-items-center p-20">
              <div className="bg-main-600 text-white rounded-8 d-flex align-items-center justify-content-center me-16"
                   style={{ width: '56px', height: '56px', minWidth: '56px' }}>
                <i className="fas fa-chalkboard-teacher fa-lg"></i>
              </div>
              <div>
                <h4 className="text-neutral-900 fw-bold mb-4">{classes.length}</h4>
                <p className="text-neutral-500 mb-0 text-13">Tổng số lớp</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="bg-white border border-success-200 rounded-12 box-shadow-sm transition-2 item-hover">
            <Card.Body className="d-flex align-items-center p-20">
              <div className="bg-success-600 text-white rounded-8 d-flex align-items-center justify-content-center me-16"
                   style={{ width: '56px', height: '56px', minWidth: '56px' }}>
                <i className="fas fa-play-circle fa-lg"></i>
              </div>
              <div>
                <h4 className="text-neutral-900 fw-bold mb-4">
                  {classes.filter(c => c.status === 'active').length}
                </h4>
                <p className="text-neutral-500 mb-0 text-13">Đang học</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="bg-white border border-warning-200 rounded-12 box-shadow-sm transition-2 item-hover">
            <Card.Body className="d-flex align-items-center p-20">
              <div className="bg-warning-600 text-white rounded-8 d-flex align-items-center justify-content-center me-16"
                   style={{ width: '56px', height: '56px', minWidth: '56px' }}>
                <i className="fas fa-clock fa-lg"></i>
              </div>
              <div>
                <h4 className="text-neutral-900 fw-bold mb-4">
                  {classes.filter(c => c.status === 'pending').length}
                </h4>
                <p className="text-neutral-500 mb-0 text-13">Chờ khai giảng</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="bg-white border border-info-200 rounded-12 box-shadow-sm transition-2 item-hover">
            <Card.Body className="d-flex align-items-center p-20">
              <div className="bg-info-500 text-white rounded-8 d-flex align-items-center justify-content-center me-16"
                   style={{ width: '56px', height: '56px', minWidth: '56px' }}>
                <i className="fas fa-check-circle fa-lg"></i>
              </div>
              <div>
                <h4 className="text-neutral-900 fw-bold mb-4">
                  {classes.filter(c => c.status === 'completed').length}
                </h4>
                <p className="text-neutral-500 mb-0 text-13">Đã hoàn thành</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Class List */}
      <ClassList
        classes={classes}
        onEdit={(classItem) => {
          setSelectedClass(classItem);
          setShowEditModal(true);
        }}
        onDelete={handleDeleteClass}
        onViewDetails={handleViewDetails}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateClass}
        />
      )}

      {showEditModal && selectedClass && (
        <EditClassModal
          classData={selectedClass}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClass(null);
          }}
          onSubmit={handleEditClass}
        />
      )}

      {showDetails && selectedClass && (
        <ClassDetails
          classData={selectedClass}
          onClose={() => {
            setShowDetails(false);
            setSelectedClass(null);
          }}
        />
      )}
    </Container>
  );
};

export default ClassManagement;
