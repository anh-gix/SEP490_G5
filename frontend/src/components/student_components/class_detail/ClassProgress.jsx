import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import studentService from '../../../services/studentService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Class Progress Component for Student
 * Hiển thị tiến độ học tập và biểu đồ
 */
const ClassProgress = () => {
  const { classId } = useParams();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (classId) {
      fetchProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getClassProgress(classId);
      setProgress(response.progress);
    } catch (error) {
      console.error('Error fetching progress:', error);
      setError('Không thể tải tiến độ học tập');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-24 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="text-neutral-500 mt-3">Đang tải tiến độ...</p>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="p-24">
        <Alert variant="danger">{error || 'Không có dữ liệu tiến độ'}</Alert>
      </div>
    );
  }

  // Attendance chart data
  const attendanceData = {
    labels: progress.weeklyAttendance.map(w => w.week),
    datasets: [
      {
        label: 'Tỷ lệ chuyên cần (%)',
        data: progress.weeklyAttendance.map(w => w.rate),
        borderColor: 'rgb(13, 116, 255)',
        backgroundColor: 'rgba(13, 116, 255, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
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
          size: 13
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="p-24 d-flex flex-column gap-3">
      {/* Overall Progress */}
      <Row className="g-3">
        <Col md={3}>
          <Card className="bg-main-25 border border-main-200 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-20">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-main-600 text-24 fw-bold">
                    {Math.round(((progress.completedLessons || 0) / (progress.totalLessons || 1)) * 100)}%
                  </div>
                  <div className="text-neutral-700 text-13">Tiến độ học tập</div>
                </div>
                <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-book-reader"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success-25 border border-success-200 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-20">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-success-600 text-24 fw-bold">{progress.attendanceRate}%</div>
                  <div className="text-neutral-700 text-13">Chuyên cần</div>
                </div>
                <div className="bg-success-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-user-check"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-warning-25 border border-warning-200 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-20">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-warning-600 text-24 fw-bold">{progress.homeworkStats.notSubmitted}</div>
                  <div className="text-neutral-700 text-13">Bài tập chưa nộp</div>
                </div>
                <div className="bg-warning-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-tasks"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-info-25 border border-info-200 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-20">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-info-600 text-24 fw-bold">{progress.averageScore || '-'}</div>
                  <div className="text-neutral-700 text-13">Điểm TB</div>
                </div>
                <div className="bg-info-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-star"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Attendance Chart */}
      <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Header className="bg-main-25 border-0 p-20">
          <h5 className="text-neutral-900 fw-semibold mb-0">Biểu đồ chuyên cần</h5>
        </Card.Header>
        <Card.Body className="p-24">
          <div style={{ height: '300px' }}>
            <Line data={attendanceData} options={chartOptions} />
          </div>
        </Card.Body>
      </Card>

      {/* Detailed Stats */}
      <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Header className="bg-main-25 border-0 p-20">
          <h5 className="text-neutral-900 fw-semibold mb-0">Thống kê chi tiết</h5>
        </Card.Header>
        <Card.Body className="p-24">
          <Row className="g-3">
            <Col md={6}>
              <div className="border border-neutral-100 rounded-12 p-16">
                <h6 className="text-neutral-900 fw-semibold mb-12">Chuyên cần</h6>
                <div className="d-flex flex-column gap-8">
                  <div className="d-flex justify-content-between">
                    <span className="text-neutral-700 text-14">
                      <i className="fas fa-check text-success-600 me-2"></i>
                      Có mặt
                    </span>
                    <span className="fw-semibold text-14">
                      {progress.attendanceStats.present} buổi
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-neutral-700 text-14">
                      <i className="fas fa-times text-danger-600 me-2"></i>
                      Vắng
                    </span>
                    <span className="fw-semibold text-14">
                      {progress.attendanceStats.absent} buổi
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-neutral-700 text-14">
                      <i className="fas fa-clock text-warning-600 me-2"></i>
                      Trễ
                    </span>
                    <span className="fw-semibold text-14">
                      {progress.attendanceStats.late} buổi
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-neutral-700 text-14">
                      <i className="fas fa-user-shield text-info-600 me-2"></i>
                      Có phép
                    </span>
                    <span className="fw-semibold text-14">
                      {progress.attendanceStats.excused} buổi
                    </span>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="border border-neutral-100 rounded-12 p-16">
                <h6 className="text-neutral-900 fw-semibold mb-12">Bài tập</h6>
                <div className="d-flex flex-column gap-8">
                  <div className="d-flex justify-content-between">
                    <span className="text-neutral-700 text-14">
                      <i className="fas fa-check text-success-600 me-2"></i>
                      Đã nộp
                    </span>
                    <span className="fw-semibold text-14">{progress.homeworkStats.submitted} bài</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-neutral-700 text-14">
                      <i className="fas fa-exclamation text-warning-600 me-2"></i>
                      Nộp trễ
                    </span>
                    <span className="fw-semibold text-14">{progress.homeworkStats.late} bài</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-neutral-700 text-14">
                      <i className="fas fa-times text-danger-600 me-2"></i>
                      Chưa nộp
                    </span>
                    <span className="fw-semibold text-14">{progress.homeworkStats.notSubmitted} bài</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-neutral-700 text-14">
                      <i className="fas fa-star text-success-600 me-2"></i>
                      Đã chấm
                    </span>
                    <span className="fw-semibold text-14">{progress.homeworkStats.graded} bài</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Grades History */}
      {progress.gradesHistory && progress.gradesHistory.length > 0 && (
        <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Header className="bg-main-25 border-0 p-20">
            <h5 className="text-neutral-900 fw-semibold mb-0">Lịch sử điểm</h5>
          </Card.Header>
          <Card.Body className="p-24">
            <div className="d-flex flex-column gap-12">
              {progress.gradesHistory.map((grade, index) => (
                <div key={index} className="border border-neutral-100 rounded-8 p-12 d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-neutral-900 fw-semibold text-14">
                      Buổi {grade.lessonNumber} - {grade.type}
                    </div>
                    <div className="text-neutral-500 text-12">
                      {new Date(grade.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="text-main-600 fw-bold text-18">{grade.score}</div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ClassProgress;
