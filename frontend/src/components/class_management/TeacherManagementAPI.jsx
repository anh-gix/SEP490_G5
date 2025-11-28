import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, InputGroup, Nav, Tabs, Tab, Pagination, ButtonGroup } from 'react-bootstrap';
import teacherService from '../../services/teacherService';
import ScheduleCalendar from './ScheduleCalendar';

/**
 * Teacher Management Component with API Integration
 * Quản lý Giảng viên đầy đủ chức năng
 */
const TeacherManagementAPI = () => {
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherSchedule, setTeacherSchedule] = useState([]);
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleViewMode, setScheduleViewMode] = useState('calendar'); // 'table' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTeachers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      
      const data = await teacherService.getAllTeachers(params);
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err.message || 'Không thể tải danh sách giảng viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await teacherService.getTeacherStats();
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleViewDetail = async (teacher) => {
    try {
      setLoading(true);
      const data = await teacherService.getTeacherById(teacher._id);
      setSelectedTeacher(data.teacher);
      
      // Fetch teacher's schedule
      const scheduleData = await teacherService.getTeacherSchedule(teacher._id);
      setTeacherSchedule(scheduleData.schedules || []);
      setSchedulePage(1); // Reset to first page when opening modal
      
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching teacher details:', err);
      alert('Không thể tải thông tin chi tiết');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: 'bg-success-600', text: 'Hoạt động', icon: 'fa-check-circle' },
      inactive: { bg: 'bg-danger-600', text: 'Tạm nghỉ', icon: 'fa-times-circle' }
    };
    const { bg, text, icon } = config[status] || config.active;
    return (
      <Badge className={`${bg} text-white px-12 py-6`}>
        <i className={`fas ${icon} me-1`}></i>
        {text}
      </Badge>
    );
  };

  const filteredTeachers = teachers;

  // Transform schedule data for calendar view
  const calendarSchedules = useMemo(() => {
    return teacherSchedule.map((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = scheduleDate.toISOString().split('T')[0];
      
      return {
        id: schedule._id || index,
        date: dateStr,
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        className: schedule.class?.name || 'N/A',
        roomName: schedule.room?.room_name || 'N/A',
        topic: schedule.topic || '',
        status: schedule.status === 'fixed' ? 'scheduled' : schedule.status === 'temporary' ? 'makeup' : 'scheduled',
        attendanceStatus: null, // Teachers don't have attendance status
        hasAttendance: false,
        teacherName: selectedTeacher?.fullName || 'N/A',
        lessonNumber: schedule.session?.order || '',
        lessonTopic: schedule.topic || ''
      };
    });
  }, [teacherSchedule, selectedTeacher]);

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Quản lý Giảng viên</h4>
          <p className="text-neutral-600 mb-0">Quản lý thông tin và lịch giảng dạy</p>
        </div>
      </div>

      {/* Stats Cards */}
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
                    background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
                  }}
                >
                  <i className="fas fa-chalkboard-teacher text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng giảng viên</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.total || 0}</div>
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
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  }}
                >
                  <i className="fas fa-user-check text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Đang hoạt động</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.active || 0}</div>
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
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  }}
                >
                  <i className="fas fa-door-open text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng lớp</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.totalClasses || 0}</div>
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
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  }}
                >
                  <i className="fas fa-user-slash text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tạm nghỉ</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.inactive || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and View Toggle */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-20">
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-neutral-50 border-neutral-200">
                  <i className="fas fa-search text-neutral-600"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm theo tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-neutral-200"
                />
              </InputGroup>
            </Col>

            <Col md={3}>
              <Form.Select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border-neutral-200"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm nghỉ</option>
              </Form.Select>
            </Col>

            <Col md={5} className="text-end">
              <div className="btn-group">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                  onClick={() => setViewMode('grid')}
                  className="px-16"
                >
                  <i className="fas fa-th me-2"></i>
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                  onClick={() => setViewMode('list')}
                  className="px-16"
                >
                  <i className="fas fa-list me-2"></i>
                  List
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Grid View */}
      {!loading && !error && viewMode === 'grid' && (
        <Row className="g-3">
          {filteredTeachers.map(teacher => (
            <Col key={teacher._id} lg={4} md={6}>
              <Card className="bg-white border-0 rounded-12 box-shadow-sm h-100">
                <Card.Body className="p-20">
                  <div className="d-flex align-items-start gap-16 mb-16">
                    <div 
                      className="rounded-circle bg-primary-50 d-flex align-items-center justify-content-center"
                      style={{ width: '56px', height: '56px', flexShrink: 0 }}
                    >
                      <i className="fas fa-user-tie text-primary" style={{ fontSize: '24px' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-neutral-900 fw-semibold mb-4">{teacher.fullName}</h6>
                      <p className="text-neutral-600 text-13 mb-0">{teacher.email}</p>
                    </div>
                    {getStatusBadge(teacher.status)}
                  </div>

                  <div className="mb-16">
                    <div className="d-flex align-items-center gap-8 mb-8">
                      <i className="fas fa-door-open text-neutral-400"></i>
                      <span className="text-neutral-700 text-14">
                        Lớp: {teacher.stats?.classCount || 0} lớp
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-8">
                      <i className="fas fa-users text-neutral-400"></i>
                      <span className="text-neutral-700 text-14">
                        Học viên: {teacher.stats?.totalStudents || 0} người
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-8">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewDetail(teacher)}
                      className="flex-grow-1"
                    >
                      <i className="fas fa-eye me-1"></i>
                      Chi tiết
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* List View */}
      {!loading && !error && viewMode === 'list' && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Giảng viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Email</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Số điện thoại</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Lớp học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(teacher => (
                  <tr key={teacher._id}>
                    <td className="px-20 py-16">
                      <div className="d-flex align-items-center gap-12">
                        <div 
                          className="rounded-circle bg-primary-50 d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <i className="fas fa-user-tie text-primary"></i>
                        </div>
                        <div className="text-neutral-900 fw-semibold text-14">{teacher.fullName}</div>
                      </div>
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-14">{teacher.email}</td>
                    <td className="px-20 py-16 text-neutral-700 text-14">{teacher.phone || 'N/A'}</td>
                    <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                      {teacher.stats?.classCount || 0}
                    </td>
                    <td className="px-20 py-16">
                      {getStatusBadge(teacher.status)}
                    </td>
                    <td className="px-20 py-16">
                      <div className="d-flex gap-8">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewDetail(teacher)}
                        >
                          <i className="fas fa-eye me-1"></i>
                          Chi tiết
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Teacher Detail Modal */}
      <Modal show={showDetailModal} onHide={() => { setShowDetailModal(false); setSchedulePage(1); }} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết giảng viên - {selectedTeacher?.fullName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTeacher && (
            <Tabs defaultActiveKey="info" className="mb-3">
              {/* Info Tab */}
              <Tab eventKey="info" title={<><i className="fas fa-user me-2"></i>Thông tin</>}>
                <Row className="g-3">
                  <Col md={6}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <h6 className="text-13 text-neutral-500 mb-8">Email</h6>
                        <p className="text-14 text-neutral-900 mb-0">{selectedTeacher.email}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <h6 className="text-13 text-neutral-500 mb-8">Số điện thoại</h6>
                        <p className="text-14 text-neutral-900 mb-0">{selectedTeacher.phone || 'N/A'}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={12}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <h6 className="text-13 text-neutral-500 mb-8">Địa chỉ</h6>
                        <p className="text-14 text-neutral-900 mb-0">{selectedTeacher.address || 'N/A'}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <h6 className="text-13 text-neutral-500 mb-8">Trạng thái</h6>
                        {getStatusBadge(selectedTeacher.status)}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              {/* Classes Tab */}
              <Tab eventKey="classes" title={<><i className="fas fa-door-open me-2"></i>Lớp học ({selectedTeacher.classes?.length || 0})</>}>
                {selectedTeacher.classes && selectedTeacher.classes.length > 0 ? (
                  <Table hover>
                    <thead className="bg-neutral-25">
                      <tr>
                        <th className="px-16 py-12 text-13">Lớp</th>
                        <th className="px-16 py-12 text-13">Khóa học</th>
                        <th className="px-16 py-12 text-13">Trình độ</th>
                        <th className="px-16 py-12 text-13">Học viên</th>
                        <th className="px-16 py-12 text-13">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTeacher.classes.map((cls, index) => (
                        <tr key={index}>
                          <td className="px-16 py-12 fw-semibold">{cls.name}</td>
                          <td className="px-16 py-12">{cls.course?.name || 'N/A'}</td>
                          <td className="px-16 py-12">
                            <Badge bg="info">{cls.level}</Badge>
                          </td>
                          <td className="px-16 py-12">{cls.students?.length || 0}</td>
                          <td className="px-16 py-12">
                            <Badge bg={cls.status === 'active' ? 'success' : 'secondary'}>
                              {cls.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted">
                    Chưa có lớp học nào
                  </div>
                )}
              </Tab>

              {/* Schedule Tab */}
              <Tab eventKey="schedule" title={<><i className="fas fa-calendar me-2"></i>Lịch giảng dạy</>}>
                {teacherSchedule.length > 0 ? (
                  <>
                    {/* View Toggle */}
                    <div className="d-flex justify-content-end mb-3">
                      <ButtonGroup>
                        <Button
                          variant={scheduleViewMode === 'table' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => setScheduleViewMode('table')}
                        >
                          <i className="fas fa-table me-2"></i>
                          Bảng
                        </Button>
                        <Button
                          variant={scheduleViewMode === 'calendar' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => setScheduleViewMode('calendar')}
                        >
                          <i className="fas fa-calendar-alt me-2"></i>
                          Lịch
                        </Button>
                      </ButtonGroup>
                    </div>

                    {/* Table View */}
                    {scheduleViewMode === 'table' && (
                      <>
                        <Table hover>
                          <thead className="bg-neutral-25">
                            <tr>
                              <th className="px-16 py-12 text-13">Thời gian</th>
                              <th className="px-16 py-12 text-13">Lớp học</th>
                              <th className="px-16 py-12 text-13">Phòng</th>
                              <th className="px-16 py-12 text-13">Chủ đề</th>
                              <th className="px-16 py-12 text-13">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teacherSchedule
                              .slice((schedulePage - 1) * 10, schedulePage * 10)
                              .map((schedule, index) => (
                              <tr key={index}>
                                <td className="px-16 py-12">
                                  <div className="text-14">
                                    {new Date(schedule.date).toLocaleDateString('vi-VN')}
                                  </div>
                                  <div className="text-13 text-muted">
                                    {schedule.startTime} - {schedule.endTime}
                                  </div>
                                </td>
                                <td className="px-16 py-12">{schedule.class?.name || 'N/A'}</td>
                                <td className="px-16 py-12">{schedule.room?.room_name || 'N/A'}</td>
                                <td className="px-16 py-12">{schedule.topic}</td>
                                <td className="px-16 py-12">
                                  <Badge bg={schedule.status === 'fixed' ? 'success' : schedule.status === 'temporary' ? 'warning' : 'secondary'}>
                                    {schedule.status === 'fixed' ? 'Buổi cố định' : schedule.status === 'temporary' ? 'Buổi tạm' : schedule.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        {teacherSchedule.length > 10 && (
                          <div className="d-flex justify-content-center mt-3">
                            <Pagination>
                              <Pagination.First 
                                onClick={() => setSchedulePage(1)} 
                                disabled={schedulePage === 1}
                              />
                              <Pagination.Prev 
                                onClick={() => setSchedulePage(prev => Math.max(1, prev - 1))} 
                                disabled={schedulePage === 1}
                              />
                              {[...Array(Math.ceil(teacherSchedule.length / 10))].map((_, i) => {
                                const page = i + 1;
                                // Show first page, last page, current page, and pages around current
                                if (
                                  page === 1 ||
                                  page === Math.ceil(teacherSchedule.length / 10) ||
                                  (page >= schedulePage - 1 && page <= schedulePage + 1)
                                ) {
                                  return (
                                    <Pagination.Item
                                      key={page}
                                      active={page === schedulePage}
                                      onClick={() => setSchedulePage(page)}
                                    >
                                      {page}
                                    </Pagination.Item>
                                  );
                                } else if (
                                  page === schedulePage - 2 ||
                                  page === schedulePage + 2
                                ) {
                                  return <Pagination.Ellipsis key={page} />;
                                }
                                return null;
                              })}
                              <Pagination.Next 
                                onClick={() => setSchedulePage(prev => Math.min(Math.ceil(teacherSchedule.length / 10), prev + 1))} 
                                disabled={schedulePage === Math.ceil(teacherSchedule.length / 10)}
                              />
                              <Pagination.Last 
                                onClick={() => setSchedulePage(Math.ceil(teacherSchedule.length / 10))} 
                                disabled={schedulePage === Math.ceil(teacherSchedule.length / 10)}
                              />
                            </Pagination>
                          </div>
                        )}
                      </>
                    )}

                    {/* Calendar View */}
                    {scheduleViewMode === 'calendar' && (
                      <ScheduleCalendar
                        schedules={calendarSchedules}
                        onEditSchedule={(schedule) => {
                          // Optional: Handle edit if needed
                          console.log('Edit schedule:', schedule);
                        }}
                        onDeleteSchedule={(scheduleId) => {
                          // Optional: Handle delete if needed
                          console.log('Delete schedule:', scheduleId);
                        }}
                        onCreateMakeup={(schedule) => {
                          // Optional: Handle create makeup if needed
                          console.log('Create makeup:', schedule);
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-muted">
                    Chưa có lịch giảng dạy
                  </div>
                )}
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowDetailModal(false); setSchedulePage(1); }}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherManagementAPI;
