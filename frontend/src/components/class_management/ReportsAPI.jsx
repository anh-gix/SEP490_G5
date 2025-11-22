import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import reportService from '../../services/reportService';

/**
 * Reports Component with API Integration
 * Báo cáo và Thống kê với API
 */
const ReportsAPI = () => {
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState('week');
  const [classLevel, setClassLevel] = useState('all');

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, dateRange, classLevel]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;

      switch (reportType) {
        case 'overview':
          data = await reportService.getOverviewReport();
          setReportData(data.report);
          break;

        case 'classes': {
          const classParams = {};
          if (classLevel && classLevel !== 'all') {
            classParams.level = classLevel;
          }
          data = await reportService.getClassReport(classParams);
          setReportData(data.report);
          break;
        }

        case 'students':
          data = await reportService.getStudentReport();
          setReportData(data.report);
          break;

        case 'teachers':
          data = await reportService.getTeacherReport();
          setReportData(data.report);
          break;

        case 'financial':
          data = await reportService.getFinancialReport({ period: dateRange });
          setReportData(data.report);
          break;

        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.message || 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    alert('Chức năng xuất báo cáo đang được phát triển...');
  };

  const renderOverviewReport = () => {
    if (!reportData) return null;

    return (
      <>
        <Row className="g-3 mb-24">
          <Col md={4}>
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
                    <i className="fas fa-door-open text-white" style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Tổng lớp học</div>
                    <div className="text-neutral-900 fw-bold text-32">{reportData.totalClasses || 0}</div>
                    <div className="text-success-600 text-12 mt-4">
                      <i className="fas fa-check-circle me-1"></i>
                      {reportData.activeClasses || 0} đang hoạt động
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
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
                    <i className="fas fa-users text-white" style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Tổng học viên</div>
                    <div className="text-neutral-900 fw-bold text-32">{reportData.totalStudents || 0}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
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
                    <i className="fas fa-chalkboard-teacher text-white" style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Tổng giảng viên</div>
                    <div className="text-neutral-900 fw-bold text-32">{reportData.totalTeachers || 0}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
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
                    <i className="fas fa-percentage text-white" style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Tỉ lệ tham gia trung bình</div>
                    <div className="text-neutral-900 fw-bold text-32">
                      {reportData.averageAttendance ? `${reportData.averageAttendance.toFixed(1)}%` : '0%'}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="bg-white border-0 rounded-12 box-shadow-sm">
              <Card.Body className="p-20">
                <div className="d-flex align-items-center gap-16">
                  <div 
                    className="rounded-12 d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '56px',
                      height: '56px',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                    }}
                  >
                    <i className="fas fa-graduation-cap text-white" style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Tỉ lệ hoàn thành</div>
                    <div className="text-neutral-900 fw-bold text-32">
                      {reportData.completionRate ? `${reportData.completionRate.toFixed(1)}%` : '0%'}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderClassReport = () => {
    if (!reportData || !reportData.classes) return null;

    return (
      <Card className="bg-white border-0 rounded-12 box-shadow-sm">
        <Card.Body className="p-0">
          <Table hover className="mb-0">
            <thead>
              <tr className="bg-neutral-25">
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Lớp học</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Giảng viên</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Học viên</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Buổi học</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Điểm danh TB</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {reportData.classes.map((cls, index) => (
                <tr key={index}>
                  <td className="px-20 py-16">
                    <div className="text-neutral-900 fw-semibold text-14">{cls.name}</div>
                    <div className="text-neutral-500 text-13">{cls.level}</div>
                  </td>
                  <td className="px-20 py-16 text-neutral-700 text-14">
                    {cls.teacher?.fullName || 'N/A'}
                  </td>
                  <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                    {cls.stats?.totalStudents || 0}
                  </td>
                  <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                    {cls.stats?.totalSessions || 0}
                  </td>
                  <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                    {cls.stats?.averageAttendance ? `${cls.stats.averageAttendance.toFixed(1)}%` : '0%'}
                  </td>
                  <td className="px-20 py-16">
                    <Badge bg={cls.status === 'active' ? 'success' : 'secondary'}>
                      {cls.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  const renderStudentReport = () => {
    if (!reportData || !reportData.students) return null;

    return (
      <>
        <Row className="g-3 mb-24">
          <Col md={4}>
            <Card className="bg-white border-0 rounded-12 box-shadow-sm">
              <Card.Body className="p-20 text-center">
                <h6 className="text-neutral-500 text-13 mb-8">Tổng học viên</h6>
                <div className="text-neutral-900 fw-bold text-40">{reportData.totalStudents || 0}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="bg-white border-0 rounded-12 box-shadow-sm">
              <Card.Body className="p-20 text-center">
                <h6 className="text-neutral-500 text-13 mb-8">Điểm danh trung bình</h6>
                <div className="text-neutral-900 fw-bold text-40">
                  {reportData.averageAttendance ? `${reportData.averageAttendance.toFixed(1)}%` : '0%'}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="bg-white border-0 rounded-12 box-shadow-sm">
              <Card.Body className="p-20 text-center">
                <h6 className="text-neutral-500 text-13 mb-8">Hoàn thành khóa học</h6>
                <div className="text-neutral-900 fw-bold text-40">
                  {reportData.completionRate ? `${reportData.completionRate.toFixed(1)}%` : '0%'}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Học viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Lớp học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Điểm danh</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Tiến độ</th>
                </tr>
              </thead>
              <tbody>
                {reportData.students.map((student, index) => (
                  <tr key={index}>
                    <td className="px-20 py-16">
                      <div className="text-neutral-900 fw-semibold text-14">{student.fullName}</div>
                      <div className="text-neutral-500 text-13">{student.email}</div>
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-14">
                      {student.classes?.map(cls => cls.name).join(', ') || 'N/A'}
                    </td>
                    <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                      {student.stats?.attendanceRate ? `${student.stats.attendanceRate.toFixed(1)}%` : '0%'}
                    </td>
                    <td className="px-20 py-16 text-center">
                      <Badge bg={student.stats?.progress > 80 ? 'success' : student.stats?.progress > 50 ? 'warning' : 'danger'}>
                        {student.stats?.progress || 0}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </>
    );
  };

  const renderTeacherReport = () => {
    if (!reportData || !reportData.teachers) return null;

    return (
      <>
        <Row className="g-3 mb-24">
          <Col md={4}>
            <Card className="bg-white border-0 rounded-12 box-shadow-sm">
              <Card.Body className="p-20 text-center">
                <h6 className="text-neutral-500 text-13 mb-8">Tổng giảng viên</h6>
                <div className="text-neutral-900 fw-bold text-40">{reportData.totalTeachers || 0}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="bg-white border-0 rounded-12 box-shadow-sm">
              <Card.Body className="p-20 text-center">
                <h6 className="text-neutral-500 text-13 mb-8">Tổng lớp học</h6>
                <div className="text-neutral-900 fw-bold text-40">{reportData.totalClasses || 0}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="bg-white border-0 rounded-12 box-shadow-sm">
              <Card.Body className="p-20 text-center">
                <h6 className="text-neutral-500 text-13 mb-8">Trung bình lớp/GV</h6>
                <div className="text-neutral-900 fw-bold text-40">
                  {reportData.averageClassesPerTeacher ? reportData.averageClassesPerTeacher.toFixed(1) : '0'}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Giảng viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Lớp học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Học viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Buổi dạy</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {reportData.teachers.map((teacher, index) => (
                  <tr key={index}>
                    <td className="px-20 py-16">
                      <div className="text-neutral-900 fw-semibold text-14">{teacher.fullName}</div>
                      <div className="text-neutral-500 text-13">{teacher.email}</div>
                    </td>
                    <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                      {teacher.stats?.totalClasses || 0}
                    </td>
                    <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                      {teacher.stats?.totalStudents || 0}
                    </td>
                    <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                      {teacher.stats?.totalSessions || 0}
                    </td>
                    <td className="px-20 py-16">
                      <Badge bg={teacher.status === 'active' ? 'success' : 'secondary'}>
                        {teacher.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </>
    );
  };

  const renderFinancialReport = () => {
    if (!reportData) return null;

    return (
      <>
        <Row className="g-3 mb-24">
          <Col md={6}>
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
                    <i className="fas fa-dollar-sign text-white" style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Tổng doanh thu ({dateRange})</div>
                    <div className="text-neutral-900 fw-bold text-32">
                      {reportData.totalRevenue?.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
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
                    <i className="fas fa-users text-white" style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-13 mb-4">Số học viên</div>
                    <div className="text-neutral-900 fw-bold text-32">{reportData.totalStudents || 0}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={12}>
            <Card className="bg-white border-0 rounded-12 box-shadow-sm">
              <Card.Body className="p-20">
                <h6 className="text-neutral-900 fw-semibold mb-16">Doanh thu theo lớp học</h6>
                <Table hover>
                  <thead className="bg-neutral-25">
                    <tr>
                      <th className="px-16 py-12 text-13">Lớp học</th>
                      <th className="px-16 py-12 text-13 text-center">Học viên</th>
                      <th className="px-16 py-12 text-13 text-end">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.classRevenues?.map((cls, index) => (
                      <tr key={index}>
                        <td className="px-16 py-12 fw-semibold">{cls.className}</td>
                        <td className="px-16 py-12 text-center">{cls.studentCount}</td>
                        <td className="px-16 py-12 text-end fw-medium">
                          {cls.revenue?.toLocaleString('vi-VN')} VNĐ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Báo cáo & Thống kê</h4>
          <p className="text-neutral-600 mb-0">Theo dõi và phân tích dữ liệu trung tâm</p>
        </div>
        <Button 
          className="btn-main px-20 py-10 radius-8"
          onClick={exportReport}
          disabled={loading}
        >
          <i className="fas fa-download me-2"></i>
          Xuất báo cáo
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-20">
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-13 fw-semibold">Loại báo cáo</Form.Label>
                <Form.Select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="border-neutral-200"
                >
                  <option value="overview">Tổng quan</option>
                  <option value="classes">Lớp học</option>
                  <option value="students">Học viên</option>
                  <option value="teachers">Giảng viên</option>
                  <option value="financial">Tài chính</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {(reportType === 'financial') && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="text-13 fw-semibold">Khoảng thời gian</Form.Label>
                  <Form.Select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="border-neutral-200"
                  >
                    <option value="week">Tuần này</option>
                    <option value="month">Tháng này</option>
                    <option value="quarter">Quý này</option>
                    <option value="year">Năm này</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {reportType === 'classes' && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="text-13 fw-semibold">Trình độ</Form.Label>
                  <Form.Select 
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="border-neutral-200"
                  >
                    <option value="all">Tất cả</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
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

      {/* Report Content */}
      {!loading && !error && (
        <>
          {reportType === 'overview' && renderOverviewReport()}
          {reportType === 'classes' && renderClassReport()}
          {reportType === 'students' && renderStudentReport()}
          {reportType === 'teachers' && renderTeacherReport()}
          {reportType === 'financial' && renderFinancialReport()}
        </>
      )}
    </Container>
  );
};

export default ReportsAPI;
