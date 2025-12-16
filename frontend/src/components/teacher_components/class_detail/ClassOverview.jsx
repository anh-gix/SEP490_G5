import React from 'react';
<<<<<<< HEAD
import { Row, Col, Card, ProgressBar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ClassOverview = ({ classInfo, materials, setShowMaterialModal }) => {
  return (
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
                {classInfo.totalAssignments || 0}
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
=======
import { Card, ProgressBar } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ClassOverview = ({ classInfo, attendanceByLesson = [], homeworkStats = [] }) => {
  // Calculate progress percentage
  const progressPercentage = classInfo?.totalLessons > 0 
    ? Math.round((classInfo.completedLessons / classInfo.totalLessons) * 100) 
    : 0;

  // Mocktest milestones
  const mocktestMilestones = classInfo?.mocktestMilestones || [];

  // Attendance Chart Data
  const attendanceChartData = {
    labels: attendanceByLesson.map(item => `Buổi ${item.lessonNumber}`),
    datasets: [
      {
        label: 'Tỉ lệ điểm danh (%)',
        data: attendanceByLesson.map(item => item.attendanceRate),
        backgroundColor: attendanceByLesson.map(item => {
          if (item.attendanceRate >= 90) return '#10B981';
          if (item.attendanceRate >= 70) return '#F59E0B';
          return '#EF4444';
        }),
        borderRadius: 6,
        barThickness: 24,
      }
    ]
  };

  const attendanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const data = attendanceByLesson[index];
            return `Buổi ${data.lessonNumber}`;
          },
          label: (context) => {
            const index = context.dataIndex;
            const data = attendanceByLesson[index];
            return [
              `Ngày: ${new Date(data.date).toLocaleDateString('vi-VN')}`,
              `Điểm danh: ${data.attendanceRate}%`,
              `${data.attendanceCount}/${data.totalStudents} học viên`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%',
          font: {
            size: 10
          }
        },
        grid: {
          color: '#E5E7EB',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Homework Chart Data
  const homeworkChartData = {
    labels: homeworkStats.map(item => `Buổi ${item.lessonNumber}`),
    datasets: [
      {
        label: 'Đúng hạn',
        data: homeworkStats.map(item => item.onTimeRate),
        backgroundColor: '#10B981',
        stack: 'stack1',
      },
      {
        label: 'Trễ hạn',
        data: homeworkStats.map(item => item.lateRate),
        backgroundColor: '#F59E0B',
        stack: 'stack1',
      },
      {
        label: 'Không làm',
        data: homeworkStats.map(item => item.notSubmittedRate),
        backgroundColor: '#EF4444',
        stack: 'stack1',
        borderRadius: {
          topLeft: 6,
          topRight: 6
        }
      }
    ]
  };

  const homeworkChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          font: {
            size: 11
          },
          padding: 10,
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const data = homeworkStats[index];
            return `Buổi ${data.lessonNumber}`;
          },
          afterTitle: (context) => {
            const index = context[0].dataIndex;
            const data = homeworkStats[index];
            return data.title;
          },
          label: (context) => {
            const index = context.dataIndex;
            const data = homeworkStats[index];
            const label = context.dataset.label;
            
            if (label === 'Đúng hạn') {
              return `Đúng hạn: ${data.onTime}/${data.total} (${data.onTimeRate}%)`;
            } else if (label === 'Trễ hạn') {
              return `Trễ hạn: ${data.late}/${data.total} (${data.lateRate}%)`;
            } else {
              return `Không làm: ${data.notSubmitted}/${data.total} (${data.notSubmittedRate}%)`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%',
          font: {
            size: 10
          }
        },
        grid: {
          color: '#E5E7EB',
          drawBorder: false
        }
      },
      x: {
        stacked: true,
        ticks: {
          font: {
            size: 10
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="p-24">
      {/* Row 1: Progress Bar */}
      <div className="row mb-3">
        <div className="col-12">
          <Card 
          className="bg-white border-0 rounded-12 mb-0"
          style={{ 
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
            <Card.Body className="p-16">
              <h6 className="text-neutral-900 fw-semibold mb-8 d-flex align-items-center">
                <i className="fas fa-chart-line text-main-600 me-2"></i>
                Tiến độ học tập
              </h6>
              
              <div className="d-flex justify-content-between mb-6">
                <span className="text-neutral-600 text-13">Hoàn thành</span>
                <span className="text-neutral-900 fw-semibold text-13">
                  {classInfo?.completedLessons || 0}/{classInfo?.totalLessons || 0} buổi ({progressPercentage}%)
                </span>
              </div>
              
              {/* Progress Bar Container */}
              <div style={{ position: 'relative' }}>
                <ProgressBar 
                  now={progressPercentage}
                  className="rounded-pill"
                  style={{ height: '24px', backgroundColor: '#E5E7EB' }}
                  variant="primary"
                />
                
                {/* Mocktest Milestones */}
                {mocktestMilestones.length > 0 && mocktestMilestones.map((milestone, index) => {
                  const position = classInfo?.totalLessons > 0 
                    ? (milestone.lessonNumber / classInfo.totalLessons) * 100 
                    : 0;
                  
                  const isPassed = milestone.status === 'completed';
                  const iconColor = isPassed ? '#10B981' : '#F59E0B';
                  
                  return (
                    <div
                      key={index}
                      style={{
                        position: 'absolute',
                        left: `${position}%`,
                        top: '-10px',
                        transform: 'translateX(-50%)',
                        zIndex: 10
                      }}
                      title={`Mocktest ${index + 1} - Buổi ${milestone.lessonNumber}`}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <i 
                          className="fas fa-flag" 
                          style={{ 
                            fontSize: '20px', 
                            color: iconColor,
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                          }}
                        ></i>
                        <div 
                          className="text-10 fw-semibold mt-1 px-2 py-1 rounded-pill"
                          style={{ 
                            backgroundColor: 'white',
                            border: `1px solid ${iconColor}`,
                            color: iconColor,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          MT{index + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Mocktest Legend - Inline with progress bar */}
              {mocktestMilestones.length > 0 && (
                <div className="mt-2">
                  <span className="text-11 text-neutral-500 me-2">Bài kiểm tra giữa khóa:</span>
                  {mocktestMilestones.map((milestone, index) => (
                    <span key={index} className="text-11 text-neutral-700 me-3">
                      <i className="fas fa-flag me-1" style={{ fontSize: '10px', color: milestone.status === 'completed' ? '#10B981' : '#F59E0B' }}></i>
                      <span>Mocktest {index + 1}</span>
                      <span className="text-neutral-500"> (B{milestone.lessonNumber})</span>
                    </span>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="row g-3 mt-4">
        {/* Attendance Chart */}
        <div className="col-lg-6">
          <Card 
          className="bg-white border-0 rounded-12"
          style={{ 
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
          }}
          >
            <Card.Body className="p-20">
              <h6 className="text-neutral-900 fw-semibold mb-12 d-flex align-items-center">
                <i className="fas fa-user-check text-success-600 me-2"></i>
                Tỉ lệ điểm danh theo buổi học
              </h6>
              
              {attendanceByLesson.length > 0 ? (
                <>
                  <div style={{ height: '300px' }}>
                    <Bar data={attendanceChartData} options={attendanceChartOptions} />
                  </div>
                  
                  {/* Legend */}
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <div className="text-11 d-flex align-items-center">
                      <span className="d-inline-block me-1" style={{ width: '10px', height: '10px', backgroundColor: '#10B981', borderRadius: '2px' }}></span>
                      <span className="text-neutral-700">≥ 90%</span>
                    </div>
                    <div className="text-11 d-flex align-items-center">
                      <span className="d-inline-block me-1" style={{ width: '10px', height: '10px', backgroundColor: '#F59E0B', borderRadius: '2px' }}></span>
                      <span className="text-neutral-700">70-89%</span>
                    </div>
                    <div className="text-11 d-flex align-items-center">
                      <span className="d-inline-block me-1" style={{ width: '10px', height: '10px', backgroundColor: '#EF4444', borderRadius: '2px' }}></span>
                      <span className="text-neutral-700">&lt; 70%</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
                  <i className="fas fa-calendar-times text-neutral-300 mb-2" style={{ fontSize: '36px' }}></i>
                  <p className="text-neutral-500 mb-0 text-13">Chưa có dữ liệu điểm danh</p>
                  <p className="text-neutral-400 text-11 mt-1">Dữ liệu sẽ hiển thị sau khi có buổi học đã hoàn thành</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Homework Chart */}
        <div className="col-lg-6">
          <Card 
          className="bg-white border-0 rounded-12"
          style={{ 
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
          }}
          >
            <Card.Body className="p-20">
              <h6 className="text-neutral-900 fw-semibold mb-12 d-flex align-items-center">
                <i className="fas fa-tasks text-warning-600 me-2"></i>
                Tỉ lệ hoàn thành bài tập
              </h6>
              
              {homeworkStats.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <Bar data={homeworkChartData} options={homeworkChartOptions} />
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
                  <i className="fas fa-clipboard-list text-neutral-300 mb-2" style={{ fontSize: '42px' }}></i>
                  <p className="text-neutral-500 mb-0 text-13">Chưa có bài tập nào</p>
                  <p className="text-neutral-400 text-11 mt-1">Dữ liệu sẽ hiển thị sau khi có bài tập được giao</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
>>>>>>> origin/Namvv-teacher-class-management
    </div>
  );
};

export default ClassOverview;
