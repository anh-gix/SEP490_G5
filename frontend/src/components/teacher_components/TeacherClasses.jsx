import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Teacher Classes Component
 * Danh sách lớp học của giảng viên
 */
const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      // TODO: Replace with actual API call
      const mockData = [
        {
          id: 1,
          name: 'A2-Evening-01',
          level: 'A2',
          schedule: 'Thứ 2, 4, 6 | 18:00 - 20:00',
          room: 'Room 102',
          startDate: '2025-09-01',
          endDate: '2025-11-30',
          totalLessons: 30,
          completedLessons: 18,
          totalStudents: 25,
          presentStudents: 23,
          status: 'active',
          pendingAssignments: 5,
          ungradedSubmissions: 8,
          nextLesson: {
            date: '2025-11-13',
            topic: 'Present Perfect Tense'
          }
        },
        {
          id: 2,
          name: 'B1-Afternoon-02',
          level: 'B1',
          schedule: 'Thứ 3, 5, 7 | 14:00 - 16:00',
          room: 'Room 201',
          startDate: '2025-09-15',
          endDate: '2025-12-15',
          totalLessons: 30,
          completedLessons: 12,
          totalStudents: 20,
          presentStudents: 18,
          status: 'active',
          pendingAssignments: 3,
          ungradedSubmissions: 4,
          nextLesson: {
            date: '2025-11-12',
            topic: 'Advanced Grammar'
          }
        }
      ];
      setClasses(mockData);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-success-600', text: 'Đang dạy' },
      upcoming: { bg: 'bg-info-500', text: 'Sắp mở' },
      completed: { bg: 'bg-neutral-500', text: 'Đã kết thúc' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Badge className={`${config.bg} text-white px-12 py-6`}>{config.text}</Badge>;
  };

  const filteredClasses = classes.filter(cls => {
    const matchesStatus = filterStatus === 'all' || cls.status === filterStatus;
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.level.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="mb-24">
        <h4 className="text-neutral-900 fw-bold mb-8">Lớp học của tôi</h4>
        <p className="text-neutral-600 mb-0">Quản lý các lớp học bạn đang giảng dạy</p>
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
                  <i className="fas fa-chalkboard-teacher text-main-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Lớp đang dạy</div>
                  <div className="text-neutral-900 fw-bold text-32">{classes.filter(c => c.status === 'active').length}</div>
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
                  <i className="fas fa-users text-warning-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng học viên</div>
                  <div className="text-neutral-900 fw-bold text-32">
                    {classes.reduce((sum, cls) => sum + cls.totalStudents, 0)}
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
                  <i className="fas fa-tasks text-danger-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Bài tập chờ chấm</div>
                  <div className="text-neutral-900 fw-bold text-32">
                    {classes.reduce((sum, cls) => sum + cls.ungradedSubmissions, 0)}
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
                  <i className="fas fa-chart-line text-success-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tiến độ TB</div>
                  <div className="text-neutral-900 fw-bold text-32">
                    {Math.round(classes.reduce((sum, cls) => sum + (cls.completedLessons / cls.totalLessons * 100), 0) / classes.length)}%
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
          <Row className="align-items-center g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm lớp học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="radius-8"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="radius-8"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang dạy</option>
                <option value="upcoming">Sắp mở</option>
                <option value="completed">Đã kết thúc</option>
              </Form.Select>
            </Col>
            <Col md={5} className="text-end">
              <div className="d-flex gap-8 justify-content-end">
                <Button
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'btn-main' : 'btn-outline-neutral'}
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  <i className="fas fa-th"></i>
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'btn-main' : 'btn-outline-neutral'}
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  <i className="fas fa-list"></i>
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Classes Grid/List */}
      {viewMode === 'grid' ? (
        <Row className="g-3">
          {filteredClasses.map(cls => {
            const progress = Math.round((cls.completedLessons / cls.totalLessons) * 100);
            const attendanceRate = Math.round((cls.presentStudents / cls.totalStudents) * 100);

            return (
              <Col key={cls.id} md={6} lg={4}>
                <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm transition-2 item-hover h-100">
                  {/* Card Header */}
                  <div 
                    className="p-24 rounded-top-12"
                    style={{ background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)', minHeight: '120px' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <Badge className="bg-white text-main-600 px-12 py-6 text-13 fw-semibold">{cls.level}</Badge>
                      {getStatusBadge(cls.status)}
                    </div>
                    <h5 className="text-white fw-bold mt-12 mb-0">{cls.name}</h5>
                  </div>

                  <Card.Body className="p-20">
                    {/* Schedule Info */}
                    <div className="mb-16">
                      <div className="d-flex align-items-center gap-8 mb-8">
                        <i className="fas fa-calendar-alt text-neutral-500"></i>
                        <span className="text-neutral-700 text-13">{cls.schedule}</span>
                      </div>
                      <div className="d-flex align-items-center gap-8">
                        <i className="fas fa-door-open text-neutral-500"></i>
                        <span className="text-neutral-700 text-13">{cls.room}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-16">
                      <div className="d-flex justify-content-between align-items-center mb-8">
                        <span className="text-neutral-700 text-13 fw-medium">Tiến độ giảng dạy</span>
                        <span className="text-main-600 fw-bold text-13">{progress}%</span>
                      </div>
                      <div className="bg-neutral-200 rounded-pill overflow-hidden" style={{ height: '8px' }}>
                        <div className="bg-main-600 h-100 transition-2" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="text-neutral-500 text-12 mt-4">
                        {cls.completedLessons}/{cls.totalLessons} buổi học
                      </div>
                    </div>

                    {/* Stats */}
                    <Row className="g-2 mb-16">
                      <Col xs={6}>
                        <div className="bg-success-25 border border-success-100 rounded-8 p-12 text-center">
                          <div className="text-success-600 fw-bold text-16">{attendanceRate}%</div>
                          <div className="text-neutral-600 text-11">Chuyên cần</div>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="bg-warning-25 border border-warning-100 rounded-8 p-12 text-center">
                          <div className="text-warning-600 fw-bold text-16">{cls.ungradedSubmissions}</div>
                          <div className="text-neutral-600 text-11">Chưa chấm</div>
                        </div>
                      </Col>
                    </Row>

                    {/* Next Lesson */}
                    {cls.nextLesson && (
                      <div className="bg-info-25 border border-info-100 rounded-8 p-12 mb-16">
                        <div className="text-neutral-700 text-12 mb-4">
                          <i className="fas fa-calendar-check text-info-500 me-1"></i>
                          Buổi học tiếp theo
                        </div>
                        <div className="text-neutral-900 fw-medium text-13">{cls.nextLesson.topic}</div>
                        <div className="text-neutral-500 text-12 mt-2">
                          {new Date(cls.nextLesson.date).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    )}
                  </Card.Body>

                  {/* Card Footer */}
                  <Card.Footer className="bg-neutral-25 border-0 p-16">
                    <Link to={`/teacher/classes/${cls.id}`} className="text-decoration-none">
                      <Button className="btn-main text-13 fw-semibold w-100 py-10 radius-8">
                        <i className="fas fa-arrow-right me-2"></i>
                        Quản lý lớp học
                      </Button>
                    </Link>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Lớp học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Lịch học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Học viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Tiến độ</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Chưa chấm</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map(cls => (
                  <tr key={cls.id}>
                    <td className="px-20 py-16">
                      <div className="text-neutral-900 fw-semibold text-14">{cls.name}</div>
                      <div className="text-neutral-500 text-12">{cls.level} • {cls.room}</div>
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-13">{cls.schedule}</td>
                    <td className="px-20 py-16 text-neutral-700 text-13">{cls.totalStudents}</td>
                    <td className="px-20 py-16">
                      <div className="mb-4 text-13 text-neutral-700">
                        {cls.completedLessons}/{cls.totalLessons} buổi
                      </div>
                      <ProgressBar 
                        now={(cls.completedLessons / cls.totalLessons) * 100} 
                        style={{ height: '6px' }}
                        className="bg-neutral-200"
                      />
                    </td>
                    <td className="px-20 py-16">
                      <Badge className="bg-warning-600 text-white">{cls.ungradedSubmissions}</Badge>
                    </td>
                    <td className="px-20 py-16">{getStatusBadge(cls.status)}</td>
                    <td className="px-20 py-16 text-center">
                      <Link to={`/teacher/classes/${cls.id}`}>
                        <Button className="btn-outline-main text-13 px-12 py-6 radius-6">
                          Quản lý
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default TeacherClasses;
