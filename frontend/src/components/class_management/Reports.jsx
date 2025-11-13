import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge, ProgressBar } from 'react-bootstrap';

/**
 * Reports Component
 * Báo cáo và thống kê cho Giáo vụ
 */
const Reports = () => {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [statsData, setStatsData] = useState({});

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    // Mock data
    setStatsData({
      overview: {
        totalClasses: 45,
        activeClasses: 38,
        totalStudents: 856,
        totalTeachers: 24,
        averageAttendance: 88.5,
        completionRate: 92.3
      },
      classStats: [
        {
          level: 'A1',
          total: 12,
          active: 10,
          students: 240,
          avgAttendance: 90
        },
        {
          level: 'A2',
          total: 15,
          active: 13,
          students: 325,
          avgAttendance: 87
        },
        {
          level: 'B1',
          total: 10,
          active: 9,
          students: 180,
          avgAttendance: 85
        },
        {
          level: 'B2',
          total: 8,
          active: 6,
          students: 111,
          avgAttendance: 92
        }
      ],
      teacherPerformance: [
        {
          id: 1,
          name: 'Nguyễn Văn A',
          classes: 3,
          students: 75,
          rating: 4.8,
          attendance: 92
        },
        {
          id: 2,
          name: 'Trần Thị B',
          classes: 2,
          students: 50,
          rating: 4.6,
          attendance: 88
        },
        {
          id: 3,
          name: 'Lê Văn C',
          classes: 4,
          students: 100,
          rating: 4.9,
          attendance: 90
        }
      ],
      revenueData: {
        thisMonth: 250000000,
        lastMonth: 230000000,
        growth: 8.7
      }
    });
  };

  const getRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <i 
        key={i} 
        className={`fas fa-star ${i < Math.floor(rating) ? 'text-warning-600' : 'text-neutral-300'}`}
        style={{ fontSize: '12px' }}
      ></i>
    ));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Báo cáo & Thống kê</h4>
          <p className="text-neutral-600 mb-0">Tổng hợp số liệu và phân tích hoạt động</p>
        </div>
        <div className="d-flex gap-12">
          <Form.Select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            style={{ width: '200px' }}
            className="radius-8"
          >
            <option value="thisWeek">Tuần này</option>
            <option value="thisMonth">Tháng này</option>
            <option value="thisQuarter">Quý này</option>
            <option value="thisYear">Năm này</option>
          </Form.Select>
          <Button className="btn-main px-20 py-10 radius-8">
            <i className="fas fa-download me-2"></i>
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-16">
          <div className="d-flex gap-8">
            {[
              { value: 'overview', label: 'Tổng quan', icon: 'fa-chart-line' },
              { value: 'classes', label: 'Lớp học', icon: 'fa-chalkboard' },
              { value: 'students', label: 'Học viên', icon: 'fa-user-graduate' },
              { value: 'teachers', label: 'Giảng viên', icon: 'fa-user-tie' },
              { value: 'financial', label: 'Tài chính', icon: 'fa-dollar-sign' }
            ].map(tab => (
              <Button
                key={tab.value}
                className={reportType === tab.value ? 'btn-main' : 'btn-outline-main'}
                onClick={() => setReportType(tab.value)}
                style={{ fontSize: '14px' }}
              >
                <i className={`fas ${tab.icon} me-2`}></i>
                {tab.label}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <>
          {/* KPI Cards */}
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
                      <i className="fas fa-chalkboard-teacher text-white" style={{ fontSize: '24px' }}></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-13 mb-4">Lớp đang hoạt động</div>
                      <div className="text-neutral-900 fw-bold text-32">{statsData.overview?.activeClasses}</div>
                      <div className="text-success-600 text-12">
                        <i className="fas fa-arrow-up me-1"></i>
                        +5% so với tháng trước
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
                      <i className="fas fa-user-graduate text-white" style={{ fontSize: '24px' }}></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-13 mb-4">Tổng học viên</div>
                      <div className="text-neutral-900 fw-bold text-32">{statsData.overview?.totalStudents}</div>
                      <div className="text-success-600 text-12">
                        <i className="fas fa-arrow-up me-1"></i>
                        +12 học viên mới
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
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                      }}
                    >
                      <i className="fas fa-chart-line text-white" style={{ fontSize: '24px' }}></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-13 mb-4">Tỷ lệ điểm danh TB</div>
                      <div className="text-neutral-900 fw-bold text-32">{statsData.overview?.averageAttendance}%</div>
                      <div className="text-success-600 text-12">
                        <i className="fas fa-arrow-up me-1"></i>
                        +2.3% so với tháng trước
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Area */}
          <Row className="g-3 mb-24">
            <Col lg={8}>
              <Card className="bg-white border-0 rounded-12 box-shadow-sm h-100">
                <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
                  <h6 className="text-neutral-900 fw-semibold mb-0">Số lượng học viên theo cấp độ</h6>
                </Card.Header>
                <Card.Body className="p-20">
                  {statsData.classStats?.map(stat => (
                    <div key={stat.level} className="mb-20">
                      <div className="d-flex justify-content-between mb-8">
                        <div>
                          <span className="text-neutral-900 fw-semibold text-14">{stat.level}</span>
                          <span className="text-neutral-500 text-13 ms-8">({stat.active}/{stat.total} lớp)</span>
                        </div>
                        <span className="text-neutral-900 fw-bold text-14">{stat.students} HV</span>
                      </div>
                      <ProgressBar 
                        now={(stat.students / statsData.overview?.totalStudents) * 100}
                        className="rounded-pill"
                        style={{ height: '10px' }}
                      />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="bg-white border-0 rounded-12 box-shadow-sm h-100">
                <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
                  <h6 className="text-neutral-900 fw-semibold mb-0">Tỷ lệ hoàn thành</h6>
                </Card.Header>
                <Card.Body className="p-20 d-flex align-items-center justify-content-center">
                  <div className="text-center">
                    <div 
                      className="rounded-circle bg-success-100 d-flex align-items-center justify-content-center mx-auto mb-16"
                      style={{ width: '120px', height: '120px' }}
                    >
                      <div>
                        <div className="text-success-600 fw-bold" style={{ fontSize: '32px' }}>
                          {statsData.overview?.completionRate}%
                        </div>
                        <div className="text-neutral-600 text-12">Tỷ lệ</div>
                      </div>
                    </div>
                    <div className="text-neutral-600 text-14 mb-8">
                      Tỷ lệ học viên hoàn thành khóa học
                    </div>
                    <Badge className="bg-success-600 text-white px-16 py-8">
                      Xuất sắc
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Classes Report */}
      {reportType === 'classes' && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
            <h6 className="text-neutral-900 fw-semibold mb-0">Báo cáo theo lớp học</h6>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Cấp độ</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Tổng lớp</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Đang học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Học viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Điểm danh TB</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Tiến độ</th>
                </tr>
              </thead>
              <tbody>
                {statsData.classStats?.map(stat => (
                  <tr key={stat.level}>
                    <td className="px-20 py-16">
                      <Badge className="bg-main-600 text-white px-12 py-6">{stat.level}</Badge>
                    </td>
                    <td className="px-20 py-16 text-center text-neutral-900 fw-medium">{stat.total}</td>
                    <td className="px-20 py-16 text-center text-success-600 fw-medium">{stat.active}</td>
                    <td className="px-20 py-16 text-center text-neutral-900 fw-medium">{stat.students}</td>
                    <td className="px-20 py-16 text-center">
                      <Badge className={stat.avgAttendance >= 85 ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'}>
                        {stat.avgAttendance}%
                      </Badge>
                    </td>
                    <td className="px-20 py-16">
                      <div className="d-flex align-items-center gap-12">
                        <ProgressBar 
                          now={(stat.active / stat.total) * 100}
                          style={{ height: '8px', width: '120px' }}
                        />
                        <span className="text-13">{Math.round((stat.active / stat.total) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Teacher Performance Report */}
      {reportType === 'teachers' && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
            <h6 className="text-neutral-900 fw-semibold mb-0">Hiệu suất giảng viên</h6>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Giảng viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Lớp dạy</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Học viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Đánh giá</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Điểm danh</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Hiệu suất</th>
                </tr>
              </thead>
              <tbody>
                {statsData.teacherPerformance?.map(teacher => (
                  <tr key={teacher.id}>
                    <td className="px-20 py-16">
                      <div className="text-neutral-900 fw-semibold text-14">{teacher.name}</div>
                    </td>
                    <td className="px-20 py-16 text-center text-neutral-900 fw-medium">{teacher.classes}</td>
                    <td className="px-20 py-16 text-center text-neutral-900 fw-medium">{teacher.students}</td>
                    <td className="px-20 py-16 text-center">
                      <div className="d-flex gap-2 justify-content-center mb-2">
                        {getRatingStars(teacher.rating)}
                      </div>
                      <div className="text-neutral-600 text-12">{teacher.rating}</div>
                    </td>
                    <td className="px-20 py-16 text-center">
                      <Badge className={teacher.attendance >= 90 ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'}>
                        {teacher.attendance}%
                      </Badge>
                    </td>
                    <td className="px-20 py-16">
                      <Badge className={teacher.rating >= 4.5 ? 'bg-success-600 text-white px-12 py-6' : 'bg-info-500 text-white px-12 py-6'}>
                        {teacher.rating >= 4.8 ? 'Xuất sắc' : teacher.rating >= 4.5 ? 'Tốt' : 'Khá'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Financial Report */}
      {reportType === 'financial' && (
        <>
          <Row className="g-3 mb-24">
            <Col md={4}>
              <Card className="bg-white border-0 rounded-12 box-shadow-sm">
                <Card.Body className="p-20">
                  <div className="text-neutral-600 text-13 mb-8">Doanh thu tháng này</div>
                  <div className="text-neutral-900 fw-bold text-28 mb-8">
                    {formatCurrency(statsData.revenueData?.thisMonth)}
                  </div>
                  <div className="text-success-600 text-14">
                    <i className="fas fa-arrow-up me-1"></i>
                    +{statsData.revenueData?.growth}% so với tháng trước
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="bg-white border-0 rounded-12 box-shadow-sm">
                <Card.Body className="p-20">
                  <div className="text-neutral-600 text-13 mb-8">Doanh thu tháng trước</div>
                  <div className="text-neutral-900 fw-bold text-28 mb-8">
                    {formatCurrency(statsData.revenueData?.lastMonth)}
                  </div>
                  <div className="text-neutral-500 text-14">
                    Tháng {new Date().getMonth()}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="bg-white border-0 rounded-12 box-shadow-sm">
                <Card.Body className="p-20">
                  <div className="text-neutral-600 text-13 mb-8">Tăng trưởng</div>
                  <div className="text-success-600 fw-bold text-28 mb-8">
                    +{statsData.revenueData?.growth}%
                  </div>
                  <div className="text-neutral-500 text-14">
                    So với cùng kỳ
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
              <h6 className="text-neutral-900 fw-semibold mb-0">Chi tiết doanh thu</h6>
            </Card.Header>
            <Card.Body className="p-20">
              <Table hover>
                <thead className="bg-neutral-25">
                  <tr>
                    <th className="px-16 py-12 text-13">Loại</th>
                    <th className="px-16 py-12 text-13 text-end">Số lượng</th>
                    <th className="px-16 py-12 text-13 text-end">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-16 py-12">Học phí lớp A1</td>
                    <td className="px-16 py-12 text-end">240 HV</td>
                    <td className="px-16 py-12 text-end fw-semibold">72.000.000₫</td>
                  </tr>
                  <tr>
                    <td className="px-16 py-12">Học phí lớp A2</td>
                    <td className="px-16 py-12 text-end">325 HV</td>
                    <td className="px-16 py-12 text-end fw-semibold">97.500.000₫</td>
                  </tr>
                  <tr>
                    <td className="px-16 py-12">Học phí lớp B1</td>
                    <td className="px-16 py-12 text-end">180 HV</td>
                    <td className="px-16 py-12 text-end fw-semibold">54.000.000₫</td>
                  </tr>
                  <tr>
                    <td className="px-16 py-12">Học phí lớp B2</td>
                    <td className="px-16 py-12 text-end">111 HV</td>
                    <td className="px-16 py-12 text-end fw-semibold">33.300.000₫</td>
                  </tr>
                  <tr className="bg-main-25">
                    <td className="px-16 py-12 fw-bold">Tổng cộng</td>
                    <td className="px-16 py-12 text-end fw-bold">856 HV</td>
                    <td className="px-16 py-12 text-end fw-bold text-main-600">256.800.000₫</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Reports;
