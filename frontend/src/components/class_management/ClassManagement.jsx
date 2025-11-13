import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import ClassList from './ClassList';
import CreateClassModal from './CreateClassModal';
import EditClassModal from './EditClassModal';
import ClassDetails from './ClassDetails';
import classService from '../../services/classService';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    level: '',
    status: '',
    search: ''
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.level) params.level = filters.level;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      
      const response = await classService.getAllClasses(params);
      
      const transformedClasses = response.classes.map(cls => ({
        id: cls._id,
        name: cls.name,
        level: cls.level || 'N/A',
        program: cls.courseName || cls.course?.name || 'N/A',
        band: cls.course?.level || cls.level,
        status: cls.status,
        startDate: cls.startDate ? new Date(cls.startDate).toISOString().split('T')[0] : 'N/A',
        endDate: cls.endDate ? new Date(cls.endDate).toISOString().split('T')[0] : 'N/A',
        schedule: 'N/A',
        teacherId: cls.teacher?._id || cls.teacherId || null,
        // use flattened teacherName from backend if present, otherwise fallback to username
        teacherName: cls.teacherName || cls.teacher?.username || 'N/A',
        roomId: null,
        roomName: 'N/A',
        totalStudents: cls.totalStudents || cls.students?.length || 0,
        maxStudents: cls.maxStudents || 25,
        currentLesson: cls.totalSchedules || 0,
        totalLessons: cls.totalSchedules || 0,
        completionRate: typeof cls.completionRate !== 'undefined' ? cls.completionRate : (cls.stats?.completionRate || 0)
      }));
      
      setClasses(transformedClasses);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError(err.message || 'Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [filters]);

  const handleCreateClass = async (classData) => {
    try {
      setLoading(true);
      await classService.createClass(classData);
      setShowCreateModal(false);
      alert('Tạo lớp học thành công!');
      await fetchClasses();
    } catch (err) {
      console.error('Error creating class:', err);
      alert(err.message || 'Có lỗi xảy ra khi tạo lớp học!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClass = async (classData) => {
    try {
      setLoading(true);
      await classService.updateClass(classData.id, classData);
      setShowEditModal(false);
      setSelectedClass(null);
      alert('Cập nhật lớp học thành công!');
      await fetchClasses();
    } catch (err) {
      console.error('Error updating class:', err);
      alert(err.message || 'Có lỗi xảy ra khi cập nhật lớp học!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
    
    try {
      setLoading(true);
      await classService.deleteClass(classId);
      alert('Xóa lớp học thành công!');
      await fetchClasses();
    } catch (err) {
      console.error('Error deleting class:', err);
      alert(err.message || 'Có lỗi xảy ra khi xóa lớp học!');
    } finally {
      setLoading(false);
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
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-neutral-500">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-24">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

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
                  <option value="C2">C2</option>
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

      <ClassList
        classes={classes}
        onEdit={(classItem) => {
          setSelectedClass(classItem);
          setShowEditModal(true);
        }}
        onDelete={handleDeleteClass}
        onViewDetails={handleViewDetails}
      />

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
