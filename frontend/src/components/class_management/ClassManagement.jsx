import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import ClassList from './ClassList';
import CreateClassModal from './CreateClassModal';
import ClassDetail from './ClassDetail';
import EditClassForm from './EditClassModal';
import classService from '../../services/classService';

const ClassManagement = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    level: '',
    status: '',
    search: ''
  });
  
  // Class Detail states
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  // Edit Class states
  const [showEditClass, setShowEditClass] = useState(false);
  const [selectedClassIdForEdit, setSelectedClassIdForEdit] = useState(null);
  const [editClassData, setEditClassData] = useState(null);
  const [loadingEditClass, setLoadingEditClass] = useState(false);
  const [errorEditClass, setErrorEditClass] = useState(null);

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
        level: cls.level || cls.course?.level || 'N/A', // Level từ course
        program: cls.courseName || cls.course?.name || 'N/A',
        band: cls.band || cls.course?.band || 'N/A', // Band từ course
        courseType: cls.courseType || cls.course?.program?.type || 'N/A',
        course: cls.course?._id || cls.course || null, // Keep course ID for EditClassForm
        status: cls.status,
        startDate: cls.startDate ? new Date(cls.startDate).toISOString().split('T')[0] : 'N/A',
        endDate: cls.endDate ? new Date(cls.endDate).toISOString().split('T')[0] : 'N/A',
        schedule: 'N/A',
        teacherId: cls.teacher?._id || cls.teacherId || null,
        // use flattened teacherName from backend if present, otherwise fallback to username
        teacherName: cls.teacherName || cls.teacher?.username || 'N/A',
        roomId: cls.room?._id || null,
        roomName: cls.roomName || cls.room?.room_name || 'N/A',
        roomLocation: cls.roomLocation || cls.room?.location || 'N/A',
        totalStudents: cls.totalStudents || cls.students?.length || 0,
        maxStudents: cls.maxStudents || 25,
        currentLesson: cls.completedSchedules || 0, // Số buổi đã hoàn thành
        totalLessons: cls.totalSchedules || 0, // Tổng số buổi
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
      toast.success('Tạo lớp học thành công!');
      await fetchClasses();
    } catch (err) {
      console.error('Error creating class:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi tạo lớp học!');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDataForEdit = async (classId) => {
    if (!classId) {
      setErrorEditClass('Không tìm thấy ID lớp học');
      setLoadingEditClass(false);
      return;
    }

    try {
      setLoadingEditClass(true);
      setErrorEditClass(null);
      const response = await classService.getClassById(classId);
      
      // Handle different response formats
      let fetchedClassData = null;
      if (response && response.success && response.class) {
        fetchedClassData = response.class;
      } else if (response && response.data) {
        fetchedClassData = response.data;
      } else if (response && response.class) {
        fetchedClassData = response.class;
      } else {
        fetchedClassData = response;
      }

      if (fetchedClassData) {
        // Transform to match EditClassForm expected format
        setEditClassData({
          ...fetchedClassData,
          id: fetchedClassData._id || fetchedClassData.id || classId
        });
      } else {
        setErrorEditClass('Không tìm thấy thông tin lớp học');
      }
    } catch (err) {
      console.error('Error fetching class data:', err);
      setErrorEditClass(err.message || 'Không thể tải thông tin lớp học');
    } finally {
      setLoadingEditClass(false);
    }
  };

  const handleEditClass = async (classItem) => {
    setSelectedClassIdForEdit(classItem.id);
    setShowEditClass(true);
    await fetchClassDataForEdit(classItem.id);
  };

  const handleSubmitEdit = async (submitData) => {
    try {
      const response = await classService.updateClass(submitData.id, submitData);
      // Hiển thị message từ response, nếu không có thì dùng message mặc định
      const message = response?.message || 'Cập nhật lớp học thành công!';
      toast.success(message);
      setShowEditClass(false);
      setSelectedClassIdForEdit(null);
      setEditClassData(null);
      await fetchClasses(); // Refresh list
    } catch (err) {
      console.error('Error updating class:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi cập nhật lớp học!');
      throw err; // Re-throw to let EditClassForm handle it
    }
  };

  const handleDeleteClass = async (classIdToDelete) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa lớp học này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      await classService.deleteClass(classIdToDelete);
      toast.success('Xóa lớp học thành công!');
      setShowEditClass(false);
      setSelectedClassIdForEdit(null);
      setEditClassData(null);
      await fetchClasses(); // Refresh list
    } catch (err) {
      console.error('Error deleting class:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi xóa lớp học!');
    }
  };

  const handleViewDetails = (classItem) => {
    setSelectedClassId(classItem.id);
    setShowClassDetail(true);
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

  // Render full-screen create form when showCreateModal is true
  if (showCreateModal) {
    return (
      <CreateClassModal
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClass}
      />
    );
  }

  // If showing edit class, render EditClassForm component
  if (showEditClass) {
    if (loadingEditClass) {
      return (
        <Container fluid className="py-24 px-24">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-neutral-600 mt-16">Đang tải thông tin lớp học...</p>
          </div>
        </Container>
      );
    }

    if (errorEditClass) {
      return (
        <Container fluid className="py-24 px-24">
          <Alert variant="danger" className="mb-24">
            <Alert.Heading>Lỗi!</Alert.Heading>
            <p>{errorEditClass}</p>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowEditClass(false);
                setSelectedClassIdForEdit(null);
                setEditClassData(null);
                setErrorEditClass(null);
              }}
            >
              Quay lại
            </Button>
          </Alert>
        </Container>
      );
    }

    if (editClassData) {
      return (
        <EditClassForm
          classData={editClassData}
          onSubmit={handleSubmitEdit}
          onDelete={handleDeleteClass}
          classId={selectedClassIdForEdit}
          onBack={() => {
            setShowEditClass(false);
            setSelectedClassIdForEdit(null);
            setEditClassData(null);
            setErrorEditClass(null);
            fetchClasses(); // Refresh list
          }}
        />
      );
    }
  }

  // If showing class detail, render ClassDetail component
  if (showClassDetail && selectedClassId) {
    return (
      <ClassDetail
        classId={selectedClassId}
        onBack={() => {
          setShowClassDetail(false);
          setSelectedClassId(null);
        }}
      />
    );
  }

  // Render class list view when showCreateModal is false
  return (
    <Container fluid className="py-24 px-24">

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
                  <option value="disable">Vô hiệu hóa</option>
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



      <ClassList
        classes={classes}
        onEdit={handleEditClass}
        onViewDetails={handleViewDetails}
      />
    </Container>
  );
};

export default ClassManagement;
