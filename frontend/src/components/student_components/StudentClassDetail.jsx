import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav, Tab, Form, ProgressBar, Table, Alert } from 'react-bootstrap';
import { useParams, Link, useLocation } from 'react-router-dom';

/**
 * Student Class Detail Component
 * Chi tiết lớp học với tabs: Overview, Materials, Homework, Progress
 */
const StudentClassDetail = () => {
  const { classId } = useParams();
  const location = useLocation();
  const [classInfo, setClassInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [materials, setMaterials] = useState([]);
  const [homework, setHomework] = useState([]);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetchClassDetail();
  }, [classId]);

  useEffect(() => {
    if (location.hash === '#homework' || location.state?.openHomeworkTab) {
      setActiveTab('homework');
    }
  }, [location.hash, location.state?.openHomeworkTab]);

  const fetchClassDetail = async () => {
    try {
      // TODO: Replace with actual API call
      // Mock data
      setClassInfo({
        id: classId,
        name: 'A2-Evening-01',
        level: 'A2',
        teacher: {
          name: 'Trần Thị B',
          email: 'tranthib@example.com',
          phone: '0123456789',
          avatar: null
        },
        schedule: 'Thứ 2, 4, 6 | 18:00 - 20:00',
        room: 'Room 102',
        startDate: '2025-09-01',
        endDate: '2025-11-30',
        totalLessons: 30,
        completedLessons: 18,
        description: 'Khóa học tiếng Anh cơ bản dành cho người mới bắt đầu, tập trung vào ngữ pháp cơ bản và giao tiếp hàng ngày.',
        objectives: [
          'Nắm vững ngữ pháp cơ bản tiếng Anh',
          'Có thể giao tiếp trong các tình huống hàng ngày',
          'Đọc hiểu các văn bản đơn giản',
          'Viết các đoạn văn ngắn'
        ]
      });

      setMaterials([
        {
          id: 1,
          title: 'Unit 5 - Present Perfect Tense',
          type: 'pdf',
          size: '2.5 MB',
          uploadDate: '2025-10-28',
          downloadUrl: '#',
          lessonNumber: 18
        },
        {
          id: 2,
          title: 'Grammar Exercise - Unit 5',
          type: 'pdf',
          size: '1.2 MB',
          uploadDate: '2025-10-28',
          downloadUrl: '#',
          lessonNumber: 18
        },
        {
          id: 3,
          title: 'Listening Practice - Video',
          type: 'video',
          size: '45 MB',
          uploadDate: '2025-10-25',
          downloadUrl: '#',
          lessonNumber: 17
        }
      ]);

      setHomework([
        {
          id: 1,
          title: 'Unit 6 - Grammar Exercise',
          description: 'Complete exercises 1-10 on page 45',
          dueDate: '2025-11-05',
          status: 'pending',
          score: null,
          submittedDate: null,
          feedback: null,
          attachments: []
        },
        {
          id: 2,
          title: 'Reading Comprehension Test',
          description: 'Read the passage and answer questions',
          dueDate: '2025-11-07',
          status: 'submitted',
          score: null,
          submittedDate: null,
          feedback: null,
          attachments: []
        },
        {
          id: 3,
          title: 'Unit 5 - Writing Assignment',
          description: 'Write a short paragraph about your daily routine',
          dueDate: '2025-10-30',
          status: 'graded',
          score: 9,
          submittedDate: '2025-10-29',
          feedback: 'Good work! Pay attention to verb tenses.',
          attachments: ['assignment_5.pdf']
        }
      ]);

      setProgress({
        attendanceRate: 92,
        totalPresent: 17,
        totalAbsent: 1,
        totalLate: 0,
        averageScore: 8.5,
        grades: [
          { lessonNumber: 10, type: 'Quiz', score: 8.0, date: '2025-10-10' },
          { lessonNumber: 12, type: 'Assignment', score: 9.0, date: '2025-10-15' },
          { lessonNumber: 15, type: 'Midterm', score: 8.5, date: '2025-10-22' },
          { lessonNumber: 18, type: 'Assignment', score: 9.0, date: '2025-10-29' }
        ],
        cloAchievement: [
          { clo: 'CLO1', name: 'Ngữ pháp cơ bản', progress: 85, target: 100 },
          { clo: 'CLO2', name: 'Giao tiếp hàng ngày', progress: 78, target: 100 },
          { clo: 'CLO3', name: 'Đọc hiểu', progress: 90, target: 100 },
          { clo: 'CLO4', name: 'Viết', progress: 82, target: 100 }
        ]
      });
    } catch (error) {
      console.error('Error fetching class detail:', error);
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: { icon: 'fa-file-pdf', color: 'danger' },
      doc: { icon: 'fa-file-word', color: 'info' },
      docx: { icon: 'fa-file-word', color: 'info' },
      video: { icon: 'fa-file-video', color: 'warning' },
      ppt: { icon: 'fa-file-powerpoint', color: 'warning' }
    };
    return icons[type] || { icon: 'fa-file', color: 'neutral' };
  };

  const getHomeworkStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-warning-600', text: 'Chưa nộp' },
      submitted: { bg: 'bg-info-500', text: 'Đã nộp' },
      graded: { bg: 'bg-success-600', text: 'Đã chấm' },
      late: { bg: 'bg-danger-600', text: 'Quá hạn' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={`${config.bg} text-white px-12 py-6`}>{config.text}</Badge>;
  };

  const renderOverview = () => (
    <Row className="g-3">
      <Col lg={8}>
        {/* Class Description */}
        <Card className="bg-white border-0 rounded-12 mb- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}24">
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Giới thiệu khóa học</h5>
          </Card.Header>
          <Card.Body className="p-24">
            <p className="text-neutral-700 text-14 mb-20">{classInfo?.description}</p>
            
            <h6 className="text-neutral-900 fw-semibold mb-12">Mục tiêu học tập</h6>
            <ul className="text-neutral-700 text-14">
              {classInfo?.objectives.map((obj, index) => (
                <li key={index} className="mb-8">{obj}</li>
              ))}
            </ul>
          </Card.Body>
        </Card>

        {/* Schedule Info */}
        <Card className="bg-white border-0 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Thông tin lịch học</h5>
          </Card.Header>
          <Card.Body className="p-24">
            <Row className="g-3">
              <Col md={6}>
                <div className="d-flex align-items-start gap-12 mb-16">
                  <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Lịch học</div>
                    <div className="text-neutral-900 fw-medium text-14">{classInfo?.schedule}</div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start gap-12 mb-16">
                  <div className="bg-info-500 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-door-open"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Phòng học</div>
                    <div className="text-neutral-900 fw-medium text-14">{classInfo?.room}</div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start gap-12">
                  <div className="bg-success-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Ngày bắt đầu</div>
                    <div className="text-neutral-900 fw-medium text-14">
                      {new Date(classInfo?.startDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-start gap-12">
                  <div className="bg-warning-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                    <i className="fas fa-calendar-times"></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Ngày kết thúc</div>
                    <div className="text-neutral-900 fw-medium text-14">
                      {new Date(classInfo?.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={4}>
        {/* Teacher Info */}
        <Card className="bg-white border-0 rounded-12 mb- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}24">
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Giảng viên</h5>
          </Card.Header>
          <Card.Body className="p-20">
            <div className="text-center mb-16">
              <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-12"
                   style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-user fa-2x"></i>
              </div>
              <h6 className="text-neutral-900 fw-bold mb-4">{classInfo?.teacher.name}</h6>
            </div>
            <div className="d-flex flex-column gap-12">
              <div className="d-flex align-items-center gap-8">
                <i className="fas fa-envelope text-neutral-500"></i>
                <span className="text-neutral-700 text-13">{classInfo?.teacher.email}</span>
              </div>
              <div className="d-flex align-items-center gap-8">
                <i className="fas fa-phone text-neutral-500"></i>
                <span className="text-neutral-700 text-13">{classInfo?.teacher.phone}</span>
              </div>
            </div>
            <Button className="btn-outline-main text-13 fw-medium w-100 mt-16 py-10 radius-8">
              <i className="fas fa-comment me-2"></i>
              Liên hệ giảng viên
            </Button>
          </Card.Body>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-gradient border-0 rounded-12 text-white style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}"
              style={{ background: 'linear-gradient(135deg, var(--main-600) 0%, var(--main-700) 100%)' }}>
          <Card.Body className="p-20">
            <h6 className="text-white fw-semibold mb-16">Thống kê nhanh</h6>
            <div className="d-flex flex-column gap-12">
              <div className="d-flex justify-content-between align-items-center pb-12 border-bottom border-white" style={{ borderOpacity: 0.2 }}>
                <span className="text-14" style={{ opacity: 0.9 }}>Tổng số buổi</span>
                <span className="fw-bold text-16">{classInfo?.totalLessons}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center pb-12 border-bottom border-white" style={{ borderOpacity: 0.2 }}>
                <span className="text-14" style={{ opacity: 0.9 }}>Đã học</span>
                <span className="fw-bold text-16">{classInfo?.completedLessons}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-14" style={{ opacity: 0.9 }}>Còn lại</span>
                <span className="fw-bold text-16">{classInfo?.totalLessons - classInfo?.completedLessons}</span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderMaterials = () => (
    <Card className="bg-white border-0 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
      <Card.Header className="bg-main-25 border-0 p-20">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="text-neutral-900 fw-semibold mb-0">Tài liệu học tập</h5>
          <Badge className="bg-main-600 text-white px-12 py-6">
            {materials.length} tài liệu
          </Badge>
        </div>
      </Card.Header>
      <Card.Body className="p-24">
        {materials.length > 0 ? (
          <div className="d-flex flex-column gap-12">
            {materials.map(material => {
              const fileIcon = getFileIcon(material.type);
              return (
                <Card key={material.id} className="bg-neutral-25 border border-neutral-100 rounded-12">
                  <Card.Body className="p-20">
                    <Row className="align-items-center">
                      <Col md={1}>
                        <div className={`bg-${fileIcon.color}-50 text-${fileIcon.color}-600 rounded-circle d-flex align-items-center justify-content-center`}
                             style={{ width: '48px', height: '48px' }}>
                          <i className={`fas ${fileIcon.icon} fa-lg`}></i>
                        </div>
                      </Col>
                      <Col md={7}>
                        <h6 className="text-neutral-900 fw-semibold mb-4">{material.title}</h6>
                        <div className="d-flex gap-16 text-neutral-500 text-13">
                          <span><i className="fas fa-layer-group me-1"></i>Buổi {material.lessonNumber}</span>
                          <span><i className="fas fa-weight me-1"></i>{material.size}</span>
                          <span><i className="fas fa-calendar me-1"></i>
                            {new Date(material.uploadDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </Col>
                      <Col md={4} className="text-md-end">
                        <Button className="btn-outline-main text-13 fw-medium px-16 py-8 radius-8">
                          <i className="fas fa-download me-2"></i>
                          Tải xuống
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-40">
            <i className="fas fa-folder-open fa-3x text-neutral-400 mb-16"></i>
            <p className="text-neutral-500 mb-0">Chưa có tài liệu nào</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  const renderHomework = () => (
    <div className="d-flex flex-column gap-3">
      {homework.map(hw => (
        <Card key={hw.id} className="bg-white border-0 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
          <Card.Body className="p-20">
            <Row className="align-items-start">
              <Col md={8}>
                <div className="d-flex justify-content-between align-items-start mb-12">
                  <h6 className="text-neutral-900 fw-bold mb-0">{hw.title}</h6>
                  {getHomeworkStatusBadge(hw.status)}
                </div>
                <p className="text-neutral-700 text-14 mb-12">{hw.description}</p>
                
                <div className="d-flex gap-16 text-neutral-500 text-13 mb-12">
                  <span>
                    <i className="fas fa-calendar-alt me-1"></i>
                    Hạn nộp: {new Date(hw.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                  {hw.submittedDate && (
                    <span>
                      <i className="fas fa-check-circle me-1"></i>
                      Đã nộp: {new Date(hw.submittedDate).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                {(
                  <Button
                    as={Link}
                    to={`/student/class/${classId}/homework/${hw.id}`}
                    className="btn-outline-main text-13 fw-medium px-20 py-10 radius-8"
                  >
                    <i className="fas fa-eye me-2"></i>
                    Xem chi tiết
                  </Button>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </div>
  );

  const renderProgress = () => (
    <Row className="g-3">
      <Col lg={6}>
        {/* Attendance Stats */}
        <Card className="bg-white border-0 rounded-12 mb- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}24">
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Thống kê chuyên cần</h5>
          </Card.Header>
          <Card.Body className="p-24">
            <div className="text-center mb-20">
              <div className="text-main-600 text-48 fw-bold mb-8">{progress?.attendanceRate}%</div>
              <div className="text-neutral-500 text-14">Tỷ lệ tham gia</div>
            </div>
            <Row className="g-3">
              <Col xs={4}>
                <div className="bg-success-25 border border-success-100 rounded-8 p-16 text-center">
                  <div className="text-success-600 fw-bold text-20">{progress?.totalPresent}</div>
                  <div className="text-neutral-600 text-12">Có mặt</div>
                </div>
              </Col>
              <Col xs={4}>
                <div className="bg-danger-25 border border-danger-100 rounded-8 p-16 text-center">
                  <div className="text-danger-600 fw-bold text-20">{progress?.totalAbsent}</div>
                  <div className="text-neutral-600 text-12">Vắng</div>
                </div>
              </Col>
              <Col xs={4}>
                <div className="bg-warning-25 border border-warning-100 rounded-8 p-16 text-center">
                  <div className="text-warning-600 fw-bold text-20">{progress?.totalLate}</div>
                  <div className="text-neutral-600 text-12">Trễ</div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Grade History */}
        <Card className="bg-white border-0 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Lịch sử điểm</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-12 text-neutral-900 fw-semibold text-13 border-0">Buổi</th>
                  <th className="px-20 py-12 text-neutral-900 fw-semibold text-13 border-0">Loại</th>
                  <th className="px-20 py-12 text-neutral-900 fw-semibold text-13 border-0">Điểm</th>
                  <th className="px-20 py-12 text-neutral-900 fw-semibold text-13 border-0">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {progress?.grades.map((grade, index) => (
                  <tr key={index}>
                    <td className="px-20 py-12 text-neutral-700 text-13">Buổi {grade.lessonNumber}</td>
                    <td className="px-20 py-12 text-neutral-700 text-13">{grade.type}</td>
                    <td className="px-20 py-12">
                      <Badge className="bg-warning-600 text-white px-12 py-6">
                        {grade.score}
                      </Badge>
                    </td>
                    <td className="px-20 py-12 text-neutral-500 text-13">
                      {new Date(grade.date).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={6}>
        {/* Average Score */}
        <Card className="bg-gradient border-0 rounded-12 text-white style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }} mb-24"
              style={{ background: 'linear-gradient(135deg, var(--warning-600) 0%, var(--warning-700) 100%)' }}>
          <Card.Body className="p-24 text-center">
            <div className="text-white text-48 fw-bold mb-8">{progress?.averageScore}</div>
            <div className="text-white text-16" style={{ opacity: 0.9 }}>Điểm trung bình</div>
          </Card.Body>
        </Card>

        {/* CLO Achievement */}
        <Card className="bg-white border-0 rounded-12 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
          <Card.Header className="border-0 p-20" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
            <h5 className="text-neutral-900 fw-semibold mb-0">Đạt chuẩn đầu ra (CLO)</h5>
          </Card.Header>
          <Card.Body className="p-24">
            <div className="d-flex flex-column gap-20">
              {progress?.cloAchievement.map((clo, index) => (
                <div key={index}>
                  <div className="d-flex justify-content-between align-items-center mb-8">
                    <div>
                      <span className="text-neutral-900 fw-semibold text-14">{clo.clo}</span>
                      <span className="text-neutral-500 text-13 ms-2">- {clo.name}</span>
                    </div>
                    <span className="text-main-600 fw-bold text-14">{clo.progress}%</span>
                  </div>
                  <div className="bg-neutral-200 rounded-pill overflow-hidden" style={{ height: '10px' }}>
                    <div 
                      className="bg-main-600 h-100 transition-2"
                      style={{ width: `${clo.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  if (!classInfo) {
    return (
      <Container fluid className="py-24 px-24">
        <div className="text-center py-60">
          <div className="spinner-border text-main-600 mb-16" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-neutral-500">Đang tải thông tin lớp học...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24">
      {/* Breadcrumb */}
      <nav className="mb-24">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/student/courses" className="text-main-600 text-decoration-none">
              Lớp học của tôi
            </Link>
          </li>
          <li className="breadcrumb-item active text-neutral-700">{classInfo.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <Card className="bg-gradient border-0 rounded-12 mb- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}24"
            style={{ background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)' }}>
        <Card.Body className="p-24">
          <Row className="align-items-center">
            <Col lg={8}>
              <Badge className="bg-white text-main-600 px-12 py-6 text-13 fw-semibold mb-12">
                {classInfo.level}
              </Badge>
              <h3 className="fw-bold mb-12">{classInfo.name}</h3>
              <div className="d-flex gap-20" style={{ opacity: 0.95 }}>
                <span><i className="fas fa-user me-2"></i>{classInfo.teacher.name}</span>
                <span><i className="fas fa-calendar-alt me-2"></i>{classInfo.schedule}</span>
                <span><i className="fas fa-door-open me-2"></i>{classInfo.room}</span>
              </div>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Link to="/student/schedule">
                <Button className="btn-outline-light text-13 fw-medium px-20 py-10 radius-8 me-2">
                  <i className="fas fa-calendar me-2"></i>
                  Xem lịch học
                </Button>
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Card className="bg-white border-0 rounded-12 mb- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}24">
          <Card.Header className="bg-white border-0 p-0">
            <Nav variant="tabs" className="border-0 px-20 pt-20">
              <Nav.Item>
                <Nav.Link 
                  eventKey="overview"
                  className={`px-20 py-12 text-14 fw-medium border-0 ${
                    activeTab === 'overview' 
                      ? 'text-main-600 border-bottom border-main-600 border-2' 
                      : 'text-neutral-600'
                  }`}
                >
                  <i className="fas fa-info-circle me-2"></i>
                  Tổng quan
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="materials"
                  className={`px-20 py-12 text-14 fw-medium border-0 ${
                    activeTab === 'materials' 
                      ? 'text-main-600 border-bottom border-main-600 border-2' 
                      : 'text-neutral-600'
                  }`}
                >
                  <i className="fas fa-file-alt me-2"></i>
                  Tài liệu
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="homework"
                  className={`px-20 py-12 text-14 fw-medium border-0 ${
                    activeTab === 'homework' 
                      ? 'text-main-600 border-bottom border-main-600 border-2' 
                      : 'text-neutral-600'
                  }`}
                >
                  <i className="fas fa-tasks me-2"></i>
                  Bài tập
                  {homework.filter(h => h.status === 'pending').length > 0 && (
                    <Badge className="bg-warning-600 text-white ms-2">
                      {homework.filter(h => h.status === 'pending').length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="progress"
                  className={`px-20 py-12 text-14 fw-medium border-0 ${
                    activeTab === 'progress' 
                      ? 'text-main-600 border-bottom border-main-600 border-2' 
                      : 'text-neutral-600'
                  }`}
                >
                  <i className="fas fa-chart-line me-2"></i>
                  Tiến độ
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
        </Card>

        <Tab.Content>
          <Tab.Pane eventKey="overview">{activeTab === 'overview' && renderOverview()}</Tab.Pane>
          <Tab.Pane eventKey="materials">{activeTab === 'materials' && renderMaterials()}</Tab.Pane>
          <Tab.Pane eventKey="homework">{activeTab === 'homework' && renderHomework()}</Tab.Pane>
          <Tab.Pane eventKey="progress">{activeTab === 'progress' && renderProgress()}</Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default StudentClassDetail;
