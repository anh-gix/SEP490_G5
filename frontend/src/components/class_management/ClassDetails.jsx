import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Badge, ProgressBar, Button, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import classService from '../../services/classService';

// Custom styles for modern tabs and prevent horizontal scroll
const tabStyles = `
  /* Prevent horizontal scroll */
  body {
    overflow-x: hidden;
  }
  .class-details-container {
    overflow-x: hidden;
    max-width: 100%;
  }
  .nav-tabs {
    border-bottom: 1px solid #E8E8E8;
    padding: 0 24px;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .nav-tabs::-webkit-scrollbar {
    display: none;
  }
  .nav-tabs .nav-link {
    border: none;
    border-bottom: 3px solid transparent;
    padding: 16px 24px;
    font-size: 15px;
    font-weight: 500;
    color: #595959;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    flex-shrink: 0;
    text-align: center;
  }
  .nav-tabs .nav-link:hover {
    border-bottom-color: #4A90E2;
    color: #4A90E2;
    background-color: transparent;
  }
  .nav-tabs .nav-link.active {
    border-bottom-color: #4A90E2;
    color: #4A90E2;
    font-weight: 600;
    background-color: transparent;
  }
  .nav-tabs .nav-link i {
    margin-right: 8px;
  }
  @media (max-width: 768px) {
    .nav-tabs {
      padding: 0 16px;
    }
    .nav-tabs .nav-link {
      padding: 12px 16px;
      font-size: 14px;
    }
  }
  /* Ensure all cards and containers respect max-width */
  .row {
    margin-left: 0;
    margin-right: 0;
  }
  .row > * {
    padding-left: 0;
    padding-right: 0;
  }
`;

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [students, setStudents] = useState([]);
  const [detailedClassData, setDetailedClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classId) {
        setError('Không tìm thấy ID lớp học');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const response = await classService.getClassById(classId);
        if (response.success && response.class) {
          setDetailedClassData(response.class);
          // Transform students from API to component format
          const transformedStudents = (response.class.students || []).map((student, index) => ({
            id: student._id,
            name: student.username || 'N/A',
            email: student.email || 'N/A',
            phone: student.phone || 'N/A',
            joinDate: response.class.startDate ? new Date(response.class.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            attendance: student.attendance || 0,
            homeworkCompletionRate: student.homeworkCompletionRate,
            submittedAssignments: student.submittedAssignments,
            totalAssignments: student.totalAssignments
          }));
          setStudents(transformedStudents);
        } else {
          setError('Không tìm thấy thông tin lớp học');
        }
      } catch (error) {
        console.error('Error fetching class details:', error);
        setError('Không thể tải thông tin lớp học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  // Use detailedClassData
  const displayData = detailedClassData;

  const renderInfoTab = () => (
    <div className="p-3 p-md-4" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="row g-3 g-md-4" style={{ marginLeft: 0, marginRight: 0 }}>
        <div className="col-12 col-md-6 col-lg-3">
          <Card className="h-100 border-0 shadow-sm" style={{ transition: 'all 0.3s ease', borderRadius: '12px', maxWidth: '100%' }}>
            <Card.Header className="bg-primary text-white d-flex align-items-center" style={{ padding: '16px 24px', borderRadius: '12px 12px 0 0' }}>
              <i className="fas fa-info-circle me-2" style={{ fontSize: '18px' }}></i>
              <strong style={{ fontSize: '16px', fontWeight: 600 }}>Thông tin chung</strong>
            </Card.Header>
            <Card.Body style={{ padding: '24px' }}>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center" style={{ paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Tên lớp:</span>
                  <strong style={{ fontSize: '14px', color: '#262626', textAlign: 'right', maxWidth: '60%' }}>{displayData.name}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center" style={{ paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Cấp độ:</span>
                  <Badge bg="info" style={{ borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 500 }}>{displayData.level}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center" style={{ paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Band:</span>
                  <strong style={{ fontSize: '14px', color: '#262626' }}>{displayData.band}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Trạng thái:</span>
                  <Badge bg={
                    displayData.status === 'pending' ? 'warning' :
                    displayData.status === 'active' ? 'success' :
                    displayData.status === 'completed' ? 'primary' : 'danger'
                  } style={{ borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 500 }}>
                    {displayData.status === 'active' ? 'Đang học' : 
                     displayData.status === 'pending' ? 'Chờ khai giảng' : 
                     displayData.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card className="h-100 border-0 shadow-sm" style={{ transition: 'all 0.3s ease', borderRadius: '12px', maxWidth: '100%' }}>
            <Card.Header className="bg-success text-white d-flex align-items-center" style={{ padding: '16px 24px', borderRadius: '12px 12px 0 0' }}>
              <i className="fas fa-calendar-alt me-2" style={{ fontSize: '18px' }}></i>
              <strong style={{ fontSize: '16px', fontWeight: 600 }}>Lịch học</strong>
            </Card.Header>
            <Card.Body style={{ padding: '24px' }}>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center" style={{ paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Thời gian:</span>
                  <strong style={{ fontSize: '14px', color: '#262626', textAlign: 'right' }}>{displayData.schedule || 'N/A'}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center" style={{ paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Khai giảng:</span>
                  <strong style={{ fontSize: '14px', color: '#262626' }}>{displayData.startDate ? new Date(displayData.startDate).toISOString().split('T')[0] : 'N/A'}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center" style={{ paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Kết thúc:</span>
                  <strong style={{ fontSize: '14px', color: '#262626' }}>{displayData.endDate ? new Date(displayData.endDate).toISOString().split('T')[0] : 'N/A'}</strong>
                </div>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Tiến độ:</span>
                    <strong style={{ fontSize: '14px', color: '#262626' }}>{(displayData.completedSchedules || 0)}/{(displayData.totalSchedules || 0)} buổi</strong>
                  </div>
                  <ProgressBar 
                    now={displayData.completionRate || 0} 
                    label={`${(displayData.completionRate || 0).toFixed(1)}%`}
                    variant="success"
                    style={{ height: '8px', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card className="h-100 border-0 shadow-sm" style={{ transition: 'all 0.3s ease', borderRadius: '12px', maxWidth: '100%' }}>
            <Card.Header className="bg-warning text-dark d-flex align-items-center" style={{ padding: '16px 24px', borderRadius: '12px 12px 0 0' }}>
              <i className="fas fa-chalkboard-teacher me-2" style={{ fontSize: '18px' }}></i>
              <strong style={{ fontSize: '16px', fontWeight: 600 }}>Giáo viên & Phòng học</strong>
            </Card.Header>
            <Card.Body style={{ padding: '24px' }}>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center" style={{ paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Giáo viên:</span>
                  <strong style={{ fontSize: '14px', color: '#262626', textAlign: 'right', maxWidth: '60%' }}>{displayData.teacherName || displayData.teacher?.username || 'N/A'}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Phòng học:</span>
                  <strong style={{ fontSize: '14px', color: '#262626' }}>{displayData.roomName || 'N/A'}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card className="h-100 border-0 shadow-sm" style={{ transition: 'all 0.3s ease', borderRadius: '12px', maxWidth: '100%' }}>
            <Card.Header className="bg-info text-white d-flex align-items-center" style={{ padding: '16px 24px', borderRadius: '12px 12px 0 0' }}>
              <i className="fas fa-users me-2" style={{ fontSize: '18px' }}></i>
              <strong style={{ fontSize: '16px', fontWeight: 600 }}>Học viên</strong>
            </Card.Header>
            <Card.Body style={{ padding: '24px' }}>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center" style={{ paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Tổng số:</span>
                  <strong style={{ fontSize: '14px', color: '#262626' }}>{(displayData.totalStudents || students.length)}/{(displayData.maxStudents || 25)}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Còn trống:</span>
                  <strong style={{ fontSize: '14px', color: '#262626' }}>{(displayData.maxStudents || 25) - (displayData.totalStudents || students.length)} chỗ</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

    </div>
  );

  const renderStudentsTab = () => {
    if (loading) {
      return (
        <div className="p-3 p-md-4 text-center" style={{ paddingTop: '60px', paddingBottom: '60px', maxWidth: '100%', overflowX: 'hidden' }}>
          <Spinner animation="border" variant="primary" style={{ width: '48px', height: '48px' }} />
          <p className="mt-4 text-muted" style={{ fontSize: '16px' }}>Đang tải dữ liệu học viên...</p>
        </div>
      );
    }

    return (
      <div className="p-3 p-md-4" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0" style={{ fontSize: '18px', fontWeight: 600, color: '#262626' }}>
            Danh sách học viên ({students.length}/{displayData.maxStudents || 25})
          </h5>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-5" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
            <i className="fas fa-users" style={{ fontSize: '64px', color: '#E8E8E8', marginBottom: '16px' }}></i>
            <p className="text-muted" style={{ fontSize: '16px', marginTop: '16px' }}>Chưa có học viên nào trong lớp này.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E8E8E8', maxWidth: '100%', overflowX: 'auto' }}>
            <table className="table table-hover mb-0" style={{ marginBottom: 0, minWidth: '600px' }}>
              <thead style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid #E8E8E8' }}>
                <tr>
                  <th style={{width: '60px', padding: '16px', fontSize: '14px', fontWeight: 600, color: '#262626'}}>STT</th>
                  <th style={{padding: '16px', fontSize: '14px', fontWeight: 600, color: '#262626'}}>Họ và tên</th>
                  <th style={{padding: '16px', fontSize: '14px', fontWeight: 600, color: '#262626'}}>Email</th>
                  <th style={{padding: '16px', fontSize: '14px', fontWeight: 600, color: '#262626'}}>Số điện thoại</th>
                  <th style={{width: '120px', padding: '16px', fontSize: '14px', fontWeight: 600, color: '#262626', textAlign: 'center'}}>Điểm danh</th>
                  <th style={{width: '150px', padding: '16px', fontSize: '14px', fontWeight: 600, color: '#262626', textAlign: 'center'}}>Hoàn thành bài tập</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} style={{ transition: 'background-color 0.2s ease' }}>
                    <td className="text-center" style={{padding: '16px', fontSize: '14px', color: '#595959'}}>{index + 1}</td>
                    <td style={{padding: '16px', fontSize: '14px', color: '#262626', fontWeight: 500}}>{student.name}</td>
                    <td style={{padding: '16px', fontSize: '14px', color: '#595959'}}>{student.email}</td>
                    <td style={{padding: '16px', fontSize: '14px', color: '#595959'}}>{student.phone}</td>
                    <td className="text-center" style={{padding: '16px'}}>
                      <Badge 
                        bg={student.attendance >= 80 ? 'success' : student.attendance > 0 ? 'warning' : 'secondary'}
                        style={{ borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 500 }}
                      >
                        {student.attendance}%
                      </Badge>
                    </td>
                    <td className="text-center" style={{padding: '16px'}}>
                      {student.homeworkCompletionRate !== undefined ? (
                        <div className="d-flex flex-column align-items-center gap-1">
                          <Badge 
                            bg={
                              student.homeworkCompletionRate >= 80 ? 'success' :
                              student.homeworkCompletionRate >= 60 ? 'warning' : 'danger'
                            }
                            style={{ borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 500 }}
                          >
                            {student.homeworkCompletionRate}%
                          </Badge>
                          <small className="text-muted" style={{ fontSize: '11px' }}>
                            {student.submittedAssignments || 0}/{student.totalAssignments || 0} bài
                          </small>
                        </div>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '12px' }}>N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderStatsTab = () => {
    if (loading) {
      return (
        <div className="p-3 p-md-4 text-center" style={{ paddingTop: '60px', paddingBottom: '60px', maxWidth: '100%', overflowX: 'hidden' }}>
          <Spinner animation="border" variant="primary" style={{ width: '48px', height: '48px' }} />
          <p className="mt-4 text-muted" style={{ fontSize: '16px' }}>Đang tải thống kê...</p>
        </div>
      );
    }

    return (
      <div className="p-3 p-md-4" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Hoạt động lớp học */}
        <div className="row g-3 g-md-4 mb-24" style={{ marginLeft: 0, marginRight: 0 }}>
          <div className="col-12">
            <Card className="border-0 shadow-sm" style={{ transition: 'all 0.3s ease', borderRadius: '12px', maxWidth: '100%' }}>
              <Card.Header className="bg-gradient text-white d-flex align-items-center" style={{ padding: '16px 24px', borderRadius: '12px 12px 0 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <i className="fas fa-chart-line me-2" style={{ fontSize: '18px' }}></i>
                <strong style={{ fontSize: '16px', fontWeight: 600 }}>Hoạt động lớp học</strong>
              </Card.Header>
              <Card.Body style={{ padding: '24px' }}>
                <div className="row g-4">
                  {/* Next Mocktest */}
                  {displayData.classActivity?.nextMocktest && (
                    <div className="col-12 col-md-6">
                      <Card className="border-0 h-100" style={{ 
                        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        <Card.Body className="p-20">
                          <div className="d-flex align-items-start gap-16">
                            <div 
                              className="rounded-12 d-flex align-items-center justify-content-center"
                              style={{ 
                                width: '56px',
                                height: '56px',
                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                flexShrink: 0
                              }}
                            >
                              <i className="fas fa-clipboard-check text-white" style={{ fontSize: '24px' }}></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-8 text-neutral-600 fw-medium" style={{ fontSize: '13px' }}>Mock test sắp tới</h6>
                              <h5 className="mb-12 text-neutral-900 fw-bold" style={{ fontSize: '18px' }}>
                                {displayData.classActivity.nextMocktest.title}
                              </h5>
                              <div className="mb-12">
                                <p className="mb-4 text-neutral-600" style={{ fontSize: '13px' }}>
                                  <i className="fas fa-calendar me-1"></i>
                                  {displayData.classActivity.nextMocktest.date ? new Date(displayData.classActivity.nextMocktest.date).toLocaleDateString('vi-VN') : 'N/A'}
                                </p>
                              </div>
                              <Badge 
                                bg="warning" 
                                className="text-dark"
                                style={{ fontSize: '12px', padding: '6px 12px', fontWeight: 600, borderRadius: '6px' }}
                              >
                                Còn {displayData.classActivity.nextMocktest.daysUntil} ngày
                              </Badge>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  )}

                  {/* Next Lesson */}
                  {displayData.classActivity?.nextLesson && (
                    <div className="col-12 col-md-6">
                      <Card className="border-0 h-100" style={{ 
                        background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        <Card.Body className="p-20">
                          <div className="d-flex align-items-start gap-16">
                            <div 
                              className="rounded-12 d-flex align-items-center justify-content-center"
                              style={{ 
                                width: '56px',
                                height: '56px',
                                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                                flexShrink: 0
                              }}
                            >
                              <i className="fas fa-book-open text-white" style={{ fontSize: '24px' }}></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-8 text-neutral-600 fw-medium" style={{ fontSize: '13px' }}>Buổi học tiếp theo</h6>
                              <h5 className="mb-12 text-neutral-900 fw-bold" style={{ fontSize: '18px' }}>
                                {displayData.classActivity.nextLesson.topic}
                              </h5>
                              <div className="mb-0">
                                <p className="mb-4 text-neutral-600" style={{ fontSize: '13px' }}>
                                  <i className="fas fa-calendar me-1"></i>
                                  {displayData.classActivity.nextLesson.date ? new Date(displayData.classActivity.nextLesson.date).toLocaleDateString('vi-VN') : 'N/A'}
                                </p>
                                <p className="mb-0 text-neutral-600" style={{ fontSize: '13px' }}>
                                  <i className="fas fa-clock me-1"></i>
                                  {displayData.classActivity.nextLesson.startTime} - {displayData.classActivity.nextLesson.endTime}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  )}

                  {/* Mocktest Milestones */}
                  {displayData.classActivity?.mocktestMilestones && displayData.classActivity.mocktestMilestones.length > 0 && (
                    <div className="col-12 mt-3">
                      <h6 className="mb-16 fw-semibold" style={{ fontSize: '15px', color: '#262626' }}>
                        <i className="fas fa-list-check me-2"></i>
                        Các mốc mock test
                      </h6>
                      <div className="d-flex flex-wrap gap-3">
                        {displayData.classActivity.mocktestMilestones.map((milestone, index) => (
                          <Card 
                            key={index} 
                            className="border-0"
                            style={{ 
                              backgroundColor: '#F8F9FA',
                              borderRadius: '12px',
                              minWidth: '220px',
                              flex: '1 1 auto',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F1F5F9';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#F8F9FA';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <Card.Body className="p-16">
                              <div className="d-flex align-items-center gap-2 mb-12">
                                <Badge 
                                  bg={milestone.status === 'completed' ? 'success' : 'warning'} 
                                  style={{ fontSize: '11px', padding: '4px 10px', fontWeight: 600, borderRadius: '6px' }}
                                >
                                  {milestone.status === 'completed' ? 'Đã hoàn thành' : 'Sắp tới'}
                                </Badge>
                                {milestone.status === 'upcoming' && milestone.daysUntil !== null && (
                                  <span className="text-neutral-600 fw-medium" style={{ fontSize: '12px' }}>
                                    ({milestone.daysUntil} ngày)
                                  </span>
                                )}
                              </div>
                              <div className="text-neutral-900 fw-bold mb-8" style={{ fontSize: '14px' }}>
                                {milestone.title}
                              </div>
                              <div className="text-neutral-600" style={{ fontSize: '12px' }}>
                                <i className="fas fa-calendar me-1"></i>
                                {milestone.date ? new Date(milestone.date).toLocaleDateString('vi-VN') : 'N/A'}
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Chuyên cần giáo viên - Chi tiết */}
        {displayData.teacherAttendance && (
          <div className="row g-3 g-md-4" style={{ marginLeft: 0, marginRight: 0 }}>
            <div className="col-12 col-md-6">
              <Card className="border-0 shadow-sm" style={{ transition: 'all 0.3s ease', borderRadius: '12px', maxWidth: '100%' }}>
                <Card.Header 
                  className="text-white d-flex align-items-center" 
                  style={{ 
                    padding: '16px 24px', 
                    borderRadius: '12px 12px 0 0',
                    background: displayData.teacherAttendance.rate >= 90 
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : displayData.teacherAttendance.rate >= 70
                      ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                      : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  }}
                >
                  <i className="fas fa-user-check me-2" style={{ fontSize: '18px' }}></i>
                  <strong style={{ fontSize: '16px', fontWeight: 600 }}>Chi tiết chuyên cần giáo viên</strong>
                </Card.Header>
                <Card.Body style={{ padding: '24px' }}>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-neutral-600 fw-medium" style={{ fontSize: '14px' }}>Tỷ lệ chuyên cần:</span>
                      <Badge 
                        bg={
                          displayData.teacherAttendance.rate >= 90 ? 'success' :
                          displayData.teacherAttendance.rate >= 70 ? 'warning' : 'danger'
                        }
                        style={{ borderRadius: '6px', padding: '6px 12px', fontSize: '14px', fontWeight: 600 }}
                      >
                        {displayData.teacherAttendance.rate}%
                      </Badge>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-neutral-600" style={{ fontSize: '13px' }}>
                          {displayData.teacherAttendance.presentCount} / {displayData.teacherAttendance.totalCount} buổi
                        </span>
                      </div>
                      <ProgressBar 
                        now={displayData.teacherAttendance.rate} 
                        label={`${displayData.teacherAttendance.rate}%`}
                        variant={
                          displayData.teacherAttendance.rate >= 90 ? 'success' :
                          displayData.teacherAttendance.rate >= 70 ? 'warning' : 'danger'
                        }
                        style={{ height: '12px', borderRadius: '6px' }}
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Container fluid className="class-details-container py-4 py-md-6 px-3 px-md-6" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        <div className="text-center" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <Spinner animation="border" variant="primary" style={{ width: '56px', height: '56px' }} />
          <p className="mt-4" style={{ fontSize: '16px', color: '#595959', fontWeight: 500 }}>
            Đang tải thông tin lớp học...
          </p>
        </div>
      </Container>
    );
  }

  if (error || !displayData) {
    return (
      <Container fluid className="class-details-container py-4 py-md-6 px-3 px-md-6" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        <Alert variant="danger" className="mb-4 border-0 shadow-sm" style={{ borderRadius: '12px', padding: '24px' }}>
          <Alert.Heading style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
            <i className="fas fa-exclamation-circle me-2"></i>
            Lỗi!
          </Alert.Heading>
          <p style={{ fontSize: '14px', marginBottom: 0 }}>{error || 'Không tìm thấy thông tin lớp học'}</p>
        </Alert>
        <Button 
          variant="primary" 
          onClick={() => navigate('/academic/class-management')}
          style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: 500 }}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại danh sách lớp học
        </Button>
      </Container>
    );
  }

  return (
    <>
      <style>{tabStyles}</style>
      <Container fluid className="class-details-container py-4 py-md-6 px-3 px-md-6" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        <Card className="bg-white border-0 shadow-sm mb-4" style={{ borderRadius: '12px', maxWidth: '100%', overflow: 'hidden' }}>
          <Card.Header 
            className="bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3" 
            style={{ 
              padding: '20px 16px',
              borderBottom: '1px solid #E8E8E8',
              borderRadius: '12px 12px 0 0'
            }}
          >
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <h2 className="mb-0" style={{ fontSize: '18px', fontWeight: 700, color: '#262626', lineHeight: 1.3, wordBreak: 'break-word' }}>
                Chi tiết lớp học: {displayData.name}
              </h2>
            </div>
            <Button 
              variant="outline-secondary"
              onClick={() => navigate('/academic/class-management')}
              className="d-flex align-items-center flex-shrink-0"
              style={{ 
                borderRadius: '8px', 
                padding: '10px 20px', 
                fontWeight: 500,
                borderColor: '#E8E8E8',
                color: '#595959'
              }}
            >
              <i className="fas fa-arrow-left me-2"></i>
              <span className="d-none d-sm-inline">Quay lại</span>
            </Button>
          </Card.Header>

          <Card.Body className="p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0"
              fill
            >
              <Tab eventKey="info" title={<><i className="fas fa-info-circle"></i> Thông tin</>}>
                {renderInfoTab()}
              </Tab>
              <Tab eventKey="students" title={<><i className="fas fa-users"></i> Học viên</>}>
                {renderStudentsTab()}
              </Tab>
              <Tab eventKey="stats" title={<><i className="fas fa-chart-bar"></i> Thống kê</>}>
                {renderStatsTab()}
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default ClassDetails;
