import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Tabs, Tab, ProgressBar, Modal } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';

/**
 * Teacher Class Detail Component
 * Chi tiết lớp học với 4 tabs: Overview, Students, Materials, Assignments
 */
const TeacherClassDetail = () => {
  const { classId } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  useEffect(() => {
    fetchClassDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchClassDetails = async () => {
    // Mock class data
    const mockClass = {
      id: classId,
      name: 'A2-Evening-01',
      level: 'A2',
      subject: 'English Communication',
      startDate: '2025-09-01',
      endDate: '2025-12-15',
      schedule: 'Thứ 2, 4, 6 - 18:00-20:00',
      room: 'Room 102',
      totalLessons: 30,
      completedLessons: 18,
      totalStudents: 25,
      activeStudents: 24,
      averageAttendance: 92,
      nextLesson: {
        date: '2025-11-13',
        time: '18:00-20:00',
        topic: 'Present Perfect Tense'
      }
    };

    const mockStudents = [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        code: 'SV001',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        attendanceRate: 95,
        averageScore: 8.5,
        totalAssignments: 12,
        submittedAssignments: 11,
        status: 'active'
      },
      {
        id: 2,
        name: 'Trần Thị B',
        code: 'SV002',
        email: 'tranthib@example.com',
        phone: '0901234568',
        attendanceRate: 88,
        averageScore: 7.8,
        totalAssignments: 12,
        submittedAssignments: 10,
        status: 'active'
      },
      {
        id: 3,
        name: 'Lê Văn C',
        code: 'SV003',
        email: 'levanc@example.com',
        phone: '0901234569',
        attendanceRate: 92,
        averageScore: 8.0,
        totalAssignments: 12,
        submittedAssignments: 12,
        status: 'active'
      }
    ];

    const mockMaterials = [
      {
        id: 1,
        title: 'Unit 5 - Grammar Reference',
        type: 'document',
        uploadedAt: '2025-11-01T10:00:00',
        size: '2.5 MB',
        downloads: 23,
        url: '#'
      },
      {
        id: 2,
        title: 'Listening Exercise Audio',
        type: 'audio',
        uploadedAt: '2025-11-05T14:30:00',
        size: '5.8 MB',
        downloads: 20,
        url: '#'
      },
      {
        id: 3,
        title: 'Presentation Slides - Week 9',
        type: 'presentation',
        uploadedAt: '2025-11-08T09:15:00',
        size: '8.2 MB',
        downloads: 25,
        url: '#'
      }
    ];

    const mockAssignments = [
      {
        id: 1,
        title: 'Unit 5 - Grammar Exercise',
        type: 'homework',
        dueDate: '2025-11-20',
        submitted: 18,
        total: 25,
        graded: 10,
        averageScore: 7.8
      },
      {
        id: 2,
        title: 'Listening Practice - Part 1',
        type: 'practice',
        dueDate: '2025-11-15',
        submitted: 25,
        total: 25,
        graded: 20,
        averageScore: 8.2
      }
    ];

    setClassInfo(mockClass);
    setStudents(mockStudents);
    setMaterials(mockMaterials);
    setAssignments(mockAssignments);
  };

  const getFileIcon = (type) => {
    const icons = {
      document: 'fa-file-pdf',
      audio: 'fa-file-audio',
      video: 'fa-file-video',
      presentation: 'fa-file-powerpoint'
    };
    return icons[type] || 'fa-file';
  };

  const getFileIconColor = (type) => {
    const colors = {
      document: 'text-danger-600',
      audio: 'text-success-600',
      video: 'text-warning-600',
      presentation: 'text-main-600'
    };
    return colors[type] || 'text-neutral-600';
  };

  if (!classInfo) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Breadcrumb */}
      <div className="mb-16">
        <Link to="/teacher/classes" className="text-neutral-600 text-13 text-decoration-none">
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại danh sách lớp
        </Link>
      </div>

      {/* Class Header */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24"
            style={{ background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)' }}>
        <Card.Body className="p-24">
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="d-flex align-items-center gap-12 mb-12">
                <h4 className="text-white fw-bold mb-0">{classInfo.name}</h4>
                <Badge className="bg-white text-main-600 px-12 py-6">{classInfo.level}</Badge>
              </div>
              <div className="text-white mb-12" style={{ opacity: 0.95 }}>
                <i className="fas fa-book me-2"></i>
                {classInfo.subject}
              </div>
              <div className="text-white d-flex gap-20" style={{ opacity: 0.9 }}>
                <span><i className="fas fa-calendar me-2"></i>{classInfo.schedule}</span>
                <span><i className="fas fa-door-open me-2"></i>{classInfo.room}</span>
                <span><i className="fas fa-users me-2"></i>{classInfo.activeStudents}/{classInfo.totalStudents} học viên</span>
              </div>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="text-white mb-8" style={{ opacity: 0.8 }}>Buổi tiếp theo</div>
              <div className="text-white fw-bold text-18 mb-4">
                {new Date(classInfo.nextLesson.date).toLocaleDateString('vi-VN')}
              </div>
              <div className="text-white" style={{ opacity: 0.9 }}>
                {classInfo.nextLesson.time} - {classInfo.nextLesson.topic}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm">
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="border-bottom px-20"
          >
            {/* Overview Tab */}
            <Tab eventKey="overview" title={
              <span className="px-8">
                <i className="fas fa-chart-line me-2"></i>
                Tổng quan
              </span>
            }>
              <div className="p-24">
                <Row className="g-3 mb-24">
                  <Col md={3}>
                    <Card className="bg-main-25 border-0 h-100">
                      <Card.Body className="p-20">
                        <div className="text-main-600 text-13 mb-8">Tiến độ học</div>
                        <div className="text-neutral-900 fw-bold text-28 mb-8">
                          {Math.round((classInfo.completedLessons / classInfo.totalLessons) * 100)}%
                        </div>
                        <div className="text-neutral-600 text-12">
                          {classInfo.completedLessons}/{classInfo.totalLessons} buổi
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card className="bg-success-25 border-0 h-100">
                      <Card.Body className="p-20">
                        <div className="text-success-600 text-13 mb-8">Điểm danh TB</div>
                        <div className="text-neutral-900 fw-bold text-28 mb-8">
                          {classInfo.averageAttendance}%
                        </div>
                        <div className="text-neutral-600 text-12">Tỷ lệ tham gia</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card className="bg-warning-25 border-0 h-100">
                      <Card.Body className="p-20">
                        <div className="text-warning-600 text-13 mb-8">Bài tập</div>
                        <div className="text-neutral-900 fw-bold text-28 mb-8">
                          {assignments.length}
                        </div>
                        <div className="text-neutral-600 text-12">Đã giao</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card className="bg-info-25 border-0 h-100">
                      <Card.Body className="p-20">
                        <div className="text-info-600 text-13 mb-8">Tài liệu</div>
                        <div className="text-neutral-900 fw-bold text-28 mb-8">
                          {materials.length}
                        </div>
                        <div className="text-neutral-600 text-12">Files đã tải lên</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Progress Chart */}
                <Card className="border border-neutral-100 rounded-12 mb-24">
                  <Card.Body className="p-20">
                    <h6 className="text-neutral-900 fw-semibold mb-16">Tiến độ học tập</h6>
                    <div className="mb-12">
                      <div className="d-flex justify-content-between mb-8">
                        <span className="text-neutral-600 text-13">Hoàn thành</span>
                        <span className="text-neutral-900 fw-semibold text-13">
                          {classInfo.completedLessons}/{classInfo.totalLessons} buổi
                        </span>
                      </div>
                      <ProgressBar 
                        now={(classInfo.completedLessons / classInfo.totalLessons) * 100}
                        className="rounded-pill"
                        style={{ height: '8px' }}
                      />
                    </div>
                  </Card.Body>
                </Card>

                {/* Quick Actions */}
                <Row className="g-3">
                  <Col md={6}>
                    <Link to="/teacher/assignments" className="text-decoration-none">
                      <Card className="border border-main-200 rounded-12 hover-shadow transition-2" style={{ cursor: 'pointer' }}>
                        <Card.Body className="p-20">
                          <div className="d-flex align-items-center gap-16">
                            <div className="rounded-12 bg-main-100 d-flex align-items-center justify-content-center"
                                 style={{ width: '48px', height: '48px' }}>
                              <i className="fas fa-plus text-main-600" style={{ fontSize: '20px' }}></i>
                            </div>
                            <div className="flex-grow-1">
                              <div className="text-neutral-900 fw-semibold text-15">Tạo bài tập mới</div>
                              <div className="text-neutral-500 text-12">Giao bài cho lớp này</div>
                            </div>
                            <i className="fas fa-chevron-right text-neutral-400"></i>
                          </div>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>

                  <Col md={6}>
                    <Card 
                      className="border border-success-200 rounded-12 hover-shadow transition-2" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowMaterialModal(true)}
                    >
                      <Card.Body className="p-20">
                        <div className="d-flex align-items-center gap-16">
                          <div className="rounded-12 bg-success-100 d-flex align-items-center justify-content-center"
                               style={{ width: '48px', height: '48px' }}>
                            <i className="fas fa-upload text-success-600" style={{ fontSize: '20px' }}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="text-neutral-900 fw-semibold text-15">Tải lên tài liệu</div>
                            <div className="text-neutral-500 text-12">Chia sẻ file với học viên</div>
                          </div>
                          <i className="fas fa-chevron-right text-neutral-400"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab>

            {/* Students Tab */}
            <Tab eventKey="students" title={
              <span className="px-8">
                <i className="fas fa-users me-2"></i>
                Học viên ({students.length})
              </span>
            }>
              <div className="p-0">
                <Table hover className="mb-0">
                  <thead>
                    <tr className="bg-neutral-25">
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">STT</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Mã SV</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Họ và tên</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Email</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">SĐT</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Điểm danh</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Điểm TB</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Bài tập</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id}>
                        <td className="px-20 py-16 text-neutral-700 text-13">{index + 1}</td>
                        <td className="px-20 py-16 text-neutral-900 fw-medium text-13">{student.code}</td>
                        <td className="px-20 py-16 text-neutral-900 text-14">{student.name}</td>
                        <td className="px-20 py-16 text-neutral-600 text-13">{student.email}</td>
                        <td className="px-20 py-16 text-neutral-700 text-13">{student.phone}</td>
                        <td className="px-20 py-16 text-center">
                          <Badge className={student.attendanceRate >= 90 ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'}>
                            {student.attendanceRate}%
                          </Badge>
                        </td>
                        <td className="px-20 py-16 text-center">
                          <span className="text-neutral-900 fw-bold text-14">{student.averageScore}</span>
                        </td>
                        <td className="px-20 py-16 text-center">
                          <span className="text-neutral-700 text-13">
                            {student.submittedAssignments}/{student.totalAssignments}
                          </span>
                        </td>
                        <td className="px-20 py-16">
                          <Badge className="bg-success-600 text-white px-12 py-6">Đang học</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* Materials Tab */}
            <Tab eventKey="materials" title={
              <span className="px-8">
                <i className="fas fa-folder-open me-2"></i>
                Tài liệu ({materials.length})
              </span>
            }>
              <div className="p-24">
                <div className="d-flex justify-content-between align-items-center mb-20">
                  <h6 className="text-neutral-900 fw-semibold mb-0">Tài liệu học tập</h6>
                  <Button className="btn-main px-16 py-8 radius-8" onClick={() => setShowMaterialModal(true)}>
                    <i className="fas fa-upload me-2"></i>
                    Tải lên tài liệu
                  </Button>
                </div>

                <Row className="g-3">
                  {materials.map(material => (
                    <Col md={4} key={material.id}>
                      <Card className="border border-neutral-100 rounded-12 hover-shadow transition-2 h-100">
                        <Card.Body className="p-20">
                          <div className="d-flex align-items-start gap-12 mb-12">
                            <div className={`rounded-8 d-flex align-items-center justify-content-center ${getFileIconColor(material.type)}`}
                                 style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5' }}>
                              <i className={`fas ${getFileIcon(material.type)}`} style={{ fontSize: '20px' }}></i>
                            </div>
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <div className="text-neutral-900 fw-semibold text-14 mb-4"
                                   style={{ 
                                     overflow: 'hidden', 
                                     textOverflow: 'ellipsis',
                                     display: '-webkit-box',
                                     WebkitLineClamp: 2,
                                     WebkitBoxOrient: 'vertical'
                                   }}>
                                {material.title}
                              </div>
                              <div className="text-neutral-500 text-11">
                                {new Date(material.uploadedAt).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mb-12">
                            <span className="text-neutral-600 text-12">{material.size}</span>
                            <span className="text-neutral-500 text-11">
                              <i className="fas fa-download me-1"></i>
                              {material.downloads} lượt tải
                            </span>
                          </div>

                          <div className="d-flex gap-8">
                            <Button className="btn-outline-main flex-grow-1 text-12 px-12 py-6 radius-6">
                              <i className="fas fa-eye me-1"></i>
                              Xem
                            </Button>
                            <Button className="btn-outline-danger text-12 px-12 py-6 radius-6">
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Tab>

            {/* Assignments Tab */}
            <Tab eventKey="assignments" title={
              <span className="px-8">
                <i className="fas fa-tasks me-2"></i>
                Bài tập ({assignments.length})
              </span>
            }>
              <div className="p-0">
                <Table hover className="mb-0">
                  <thead>
                    <tr className="bg-neutral-25">
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Bài tập</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Loại</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Hạn nộp</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Đã nộp</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Đã chấm</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Điểm TB</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(assignment => (
                      <tr key={assignment.id}>
                        <td className="px-20 py-16">
                          <div className="text-neutral-900 fw-semibold text-14">{assignment.title}</div>
                        </td>
                        <td className="px-20 py-16">
                          <Badge className={
                            assignment.type === 'homework' ? 'bg-info-100 text-info-600' :
                            assignment.type === 'practice' ? 'bg-warning-100 text-warning-600' :
                            'bg-danger-100 text-danger-600'
                          }>
                            {assignment.type === 'homework' ? 'Bài tập' :
                             assignment.type === 'practice' ? 'Luyện tập' : 'Kiểm tra'}
                          </Badge>
                        </td>
                        <td className="px-20 py-16 text-neutral-700 text-13">
                          {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-20 py-16 text-center">
                          <span className="text-neutral-900 fw-medium text-13">
                            {assignment.submitted}/{assignment.total}
                          </span>
                          <div className="text-neutral-500 text-11">
                            {Math.round((assignment.submitted / assignment.total) * 100)}%
                          </div>
                        </td>
                        <td className="px-20 py-16 text-center">
                          <span className="text-neutral-900 fw-medium text-13">
                            {assignment.graded}/{assignment.submitted}
                          </span>
                        </td>
                        <td className="px-20 py-16 text-center">
                          <span className="text-neutral-900 fw-bold text-14">{assignment.averageScore}</span>
                        </td>
                        <td className="px-20 py-16 text-center">
                          <Button className="btn-outline-main text-12 px-12 py-6 radius-6">
                            <i className="fas fa-eye me-1"></i>
                            Chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Upload Material Modal */}
      <Modal show={showMaterialModal} onHide={() => setShowMaterialModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tải lên tài liệu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-16">
              <Form.Label>Tên tài liệu</Form.Label>
              <Form.Control type="text" placeholder="VD: Unit 5 - Grammar Reference" />
            </Form.Group>
            <Form.Group className="mb-16">
              <Form.Label>Loại tài liệu</Form.Label>
              <Form.Select>
                <option value="document">Tài liệu</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="presentation">Presentation</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-16">
              <Form.Label>File</Form.Label>
              <Form.Control type="file" multiple />
              <Form.Text className="text-muted">
                Hỗ trợ: PDF, DOC, PPT, MP3, MP4 (Tối đa 50MB)
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-16">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Mô tả ngắn về tài liệu..." />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-outline-neutral" onClick={() => setShowMaterialModal(false)}>
            Hủy
          </Button>
          <Button className="btn-main">
            <i className="fas fa-upload me-2"></i>
            Tải lên
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherClassDetail;
