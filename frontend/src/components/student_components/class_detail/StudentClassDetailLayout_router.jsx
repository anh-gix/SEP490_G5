import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';
import { Link, Outlet, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import studentService from '../../../services/studentService';

/**
 * Student Class Detail Layout Component
 * Layout chung cho các trang chi tiết lớp học của học viên
 */
const StudentClassDetailLayout = () => {
  const { classId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && classId) {
      fetchClassInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, user]);

  const fetchClassInfo = async () => {
    try {
      setLoading(true);
      const response = await studentService.getMyClasses();
      
      if (response.success && response.classes) {
        const currentClass = response.classes.find(c => c._id === classId);
        if (currentClass) {
          setClassInfo(currentClass);
        }
      }
    } catch (error) {
      console.error('Error fetching class info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/materials')) return 'materials';
    if (path.includes('/homework')) return 'homework';
    if (path.includes('/progress')) return 'progress';
    if (path.includes('/lessons')) return 'lessons';
    return 'overview';
  };

  const activeTab = getActiveTab();

  if (loading) {
    return (
      <Container fluid className="py-24 px-24">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!classInfo) {
    return (
      <Container fluid className="py-24 px-24">
        <div className="text-center py-5">
          <p className="text-neutral-500">Không tìm thấy thông tin lớp học</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24">
      {/* Breadcrumb */}
      <div className="mb-24">
        <div className="d-flex align-items-center gap-2 mb-12">
          <Link to="/student/dashboard" className="text-neutral-600 text-14 text-decoration-none">
            Dashboard
          </Link>
          <i className="fas fa-chevron-right text-neutral-400" style={{ fontSize: '10px' }}></i>
          <Link to="/student/classes" className="text-neutral-600 text-14 text-decoration-none">
            Lớp học của tôi
          </Link>
          <i className="fas fa-chevron-right text-neutral-400" style={{ fontSize: '10px' }}></i>
          <span className="text-neutral-900 text-14 fw-semibold">{classInfo.name}</span>
        </div>
      </div>

      {/* Class Header */}
      <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Body className="p-24">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-start gap-16">
                <div 
                  className="bg-gradient rounded-12 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '80px',
                    height: '80px',
                    minWidth: '80px',
                    background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
                  }}
                >
                  <i className="fas fa-book-open fa-2x text-white"></i>
                </div>
                <div>
                  <h4 className="text-neutral-900 fw-bold mb-8">{classInfo.name}</h4>
                  <p className="text-neutral-600 text-14 mb-8">
                    {classInfo.course?.name || 'N/A'}
                  </p>
                  <div className="d-flex gap-12 flex-wrap">
                    <span className="text-neutral-500 text-13">
                      <i className="fas fa-user me-1"></i>
                      {classInfo.teacher?.username || 'Chưa có giảng viên'}
                    </span>
                    <span className="text-neutral-500 text-13">
                      <i className="fas fa-users me-1"></i>
                      {classInfo.students?.length || 0} học viên
                    </span>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="mb-12">
                <span className="text-neutral-500 text-13">Tiến độ học tập</span>
                <div className="d-flex align-items-center justify-content-md-end gap-8 mt-4">
                  <div 
                    className="bg-neutral-200 rounded-pill overflow-hidden flex-grow-1"
                    style={{ height: '8px', maxWidth: '200px' }}
                  >
                    <div 
                      className="bg-main-600 h-100"
                      style={{ width: `${Math.round((classInfo.completedLessons / classInfo.totalLessons) * 100)}%` }}
                    />
                  </div>
                  <span className="text-main-600 fw-bold text-14">
                    {Math.round((classInfo.completedLessons / classInfo.totalLessons) * 100)}%
                  </span>
                </div>
              </div>
              <div className="text-neutral-500 text-13">
                {classInfo.completedLessons}/{classInfo.totalLessons} buổi học
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Navigation Tabs */}
      <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Body className="p-0">
          <Nav variant="tabs" className="border-0">
            <Nav.Item>
              <Nav.Link
                as={Link}
                to={`/student/class/${classId}`}
                className={`px-24 py-16 text-14 fw-medium border-0 ${
                  activeTab === 'overview'
                    ? 'text-main-600 border-bottom border-main-600 border-3'
                    : 'text-neutral-600'
                }`}
                style={{ borderRadius: '0' }}
              >
                <i className="fas fa-home me-2"></i>
                Tổng quan
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to={`/student/class/${classId}/lessons`}
                className={`px-24 py-16 text-14 fw-medium border-0 ${
                  activeTab === 'lessons'
                    ? 'text-main-600 border-bottom border-main-600 border-3'
                    : 'text-neutral-600'
                }`}
                style={{ borderRadius: '0' }}
              >
                <i className="fas fa-book-reader me-2"></i>
                Buổi học
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to={`/student/class/${classId}/materials`}
                className={`px-24 py-16 text-14 fw-medium border-0 ${
                  activeTab === 'materials'
                    ? 'text-main-600 border-bottom border-main-600 border-3'
                    : 'text-neutral-600'
                }`}
                style={{ borderRadius: '0' }}
              >
                <i className="fas fa-folder-open me-2"></i>
                Tài liệu
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to={`/student/class/${classId}/homework`}
                className={`px-24 py-16 text-14 fw-medium border-0 ${
                  activeTab === 'homework'
                    ? 'text-main-600 border-bottom border-main-600 border-3'
                    : 'text-neutral-600'
                }`}
                style={{ borderRadius: '0' }}
              >
                <i className="fas fa-tasks me-2"></i>
                Bài tập
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to={`/student/class/${classId}/progress`}
                className={`px-24 py-16 text-14 fw-medium border-0 ${
                  activeTab === 'progress'
                    ? 'text-main-600 border-bottom border-main-600 border-3'
                    : 'text-neutral-600'
                }`}
                style={{ borderRadius: '0' }}
              >
                <i className="fas fa-chart-line me-2"></i>
                Tiến độ
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {/* Tab Content */}
      <Outlet context={{ classInfo, refreshClassInfo: fetchClassInfo }} />
    </Container>
  );
};

export default StudentClassDetailLayout;
