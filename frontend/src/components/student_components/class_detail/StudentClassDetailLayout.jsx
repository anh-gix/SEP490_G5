import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Tabs, Tab } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import studentService from '../../../services/studentService';

// Import tab components
import ClassOverview from './ClassOverview';
import ClassLessons from './ClassLessons';
import ClassMaterials from './ClassMaterials';
import ClassHomework from './ClassHomework';
import ClassProgress from './ClassProgress';

/**
 * Student Class Detail Layout Component
 * Main layout with tab navigation for student class details
 * Following teacher pattern with React Bootstrap Tabs
 */
const StudentClassDetailLayout = () => {
  const { classId } = useParams();
  const { user } = useAuth();
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user && classId) {
      fetchClassInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, user]);

  const fetchClassInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentService.getMyClasses();
      
      if (response.success && response.classes) {
        const currentClass = response.classes.find(c => c._id === classId);
        if (currentClass) {
          console.log('✅ Class Info:', currentClass); // Debug log
          setClassInfo(currentClass);
        } else {
          setError('Không tìm thấy lớp học');
        }
      } else {
        setError('Không thể tải danh sách lớp học');
      }
    } catch (error) {
      console.error('Error fetching class info:', error);
      setError('Lỗi khi tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };

  // Loading state
  if (loading) {
    return (
      <Container fluid className="py-24 px-24">
        <div className="text-center py-5">
          <div className="spinner-border text-main-600" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-neutral-500 mt-3">Đang tải thông tin lớp học...</p>
        </div>
      </Container>
    );
  }

  // Error state
  if (error || !classInfo) {
    return (
      <Container fluid className="py-24 px-24">
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="text-center py-5">
            <i className="fas fa-exclamation-triangle text-warning-600" style={{ fontSize: '48px' }}></i>
            <h5 className="text-neutral-700 mt-3 mb-2">{error || 'Không tìm thấy lớp học'}</h5>
            <Link to="/student/courses">
              <button className="btn btn-primary mt-3">
                <i className="fas fa-arrow-left me-2"></i>
                Quay lại danh sách lớp
              </button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24">
      {/* Breadcrumb */}
      <div className="mb-24">
        <Link to="/student/courses" className="text-neutral-600 text-14 text-decoration-none">
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại danh sách lớp
        </Link>
      </div>

      {/* Class Header */}
      <Card className="bg-white border-0 rounded-12 mb-24 text-white"
            style={{ 
              background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
            }}>
        <Card.Body className="p-24">
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="d-flex align-items-center gap-12 mb-12">
                <h4 className="text-white fw-bold mb-0">
                  {classInfo.name || 'Tên lớp học'}
                </h4>
                <Badge className="bg-white text-main-600 px-12 py-6">
                  {classInfo.course?.name || 'Chưa có khóa học'}
                </Badge>
              </div>
              <div className="text-white d-flex gap-20" style={{ opacity: 0.9 }}>
                <span>
                  <i className="fas fa-chalkboard-teacher me-2"></i>
                  {classInfo.teacher?.username || 'Chưa có giảng viên'}
                </span>
                <span>
                  <i className="fas fa-calendar me-2"></i>
                  {new Date(classInfo.startDate).toLocaleDateString('vi-VN')} - {new Date(classInfo.endDate).toLocaleDateString('vi-VN')}
                </span>
                {classInfo.room && (
                  <span>
                    <i className="fas fa-door-open me-2"></i>
                    {typeof classInfo.room === 'object' ? classInfo.room.room_name : classInfo.room}
                  </span>
                )}
              </div>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="text-white" style={{ opacity: 0.9 }}>
                <i className="fas fa-chart-line me-2"></i>
                Tiến độ: {classInfo.completedLessons || 0}/{classInfo.totalLessons || 0} buổi
              </div>
              <div className="progress mt-2" style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.3)' }}>
                <div className="progress-bar bg-white" 
                     role="progressbar" 
                     style={{ width: `${((classInfo.completedLessons || 0) / (classInfo.totalLessons || 1)) * 100}%` }}
                     aria-valuenow={(classInfo.completedLessons || 0)}
                     aria-valuemin="0"
                     aria-valuemax={classInfo.totalLessons || 1}>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs Navigation */}
      <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabSelect}
            className="border-bottom px-20"
          >
            <Tab 
              eventKey="overview" 
              title={
                <span className="px-8">
                  <i className="fas fa-home me-2"></i>
                  Tổng quan
                </span>
              }
            >
              <ClassOverview classInfo={classInfo} />
            </Tab>

            <Tab 
              eventKey="lessons" 
              title={
                <span className="px-8">
                  <i className="fas fa-book-reader me-2"></i>
                  Buổi học
                </span>
              }
            >
              <ClassLessons classInfo={classInfo} />
            </Tab>

            <Tab 
              eventKey="materials" 
              title={
                <span className="px-8">
                  <i className="fas fa-folder-open me-2"></i>
                  Tài liệu
                </span>
              }
            >
              <ClassMaterials classInfo={classInfo} />
            </Tab>

            <Tab 
              eventKey="homework" 
              title={
                <span className="px-8">
                  <i className="fas fa-tasks me-2"></i>
                  Bài tập
                </span>
              }
            >
              <ClassHomework classInfo={classInfo} />
            </Tab>

            <Tab 
              eventKey="progress" 
              title={
                <span className="px-8">
                  <i className="fas fa-chart-line me-2"></i>
                  Tiến độ
                </span>
              }
            >
              <ClassProgress classInfo={classInfo} />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StudentClassDetailLayout;
