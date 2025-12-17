import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import studentService from '../../../services/studentService';

/**
 * Class Progress Component for Student
 * Thiết kế đơn giản tập trung vào thông số quan trọng cho phụ huynh
 */

/* eslint-disable no-unused-vars */
const ClassProgress = ({ classInfo }) => {
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
      console.log('📊 Class Progress:', response.progress); // Debug log
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

  // Calculate percentages
  const totalLessons = progress.totalLessons || 1;
  const completedLessons = progress.completedLessons || 0;
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
  
  const absentLessons = progress.attendanceStats?.absent || 0;
  const absentPercentage = Math.round((absentLessons / totalLessons) * 100);
  const shouldAlertAttendance = absentPercentage >= 20;

  const totalHomework = progress.homeworkStats?.total || 0;
  const completedHomework = progress.homeworkStats?.submitted || 0;
  const lateHomework = progress.homeworkStats?.late || 0;
  const latePercentage = totalHomework > 0 ? Math.round((lateHomework / totalHomework) * 100) : 0;
  const shouldAlertHomework = latePercentage >= 20;

  // Get absent lessons list from progress
  const absentLessonsList = progress.absentLessons || [];
  
  // Get incomplete homework list from progress
  const incompleteHomework = progress.incompleteHomework || [];
  const lateHomeworkList = progress.lateHomework || [];

  // Get mocktest scores from progress (already formatted as array)
  // progress.mocktestScores structure: [{ mocktestNumber, sessionOrder, title, totalScore, skillScores: {...}, date }, ...]
  const mocktestScores = progress.mocktestScores || [];

  // Get mocktest milestones from classInfo.course
  const courseMocktestSessions = classInfo?.course?.mocktestSessionOrders || [];
  const mocktestMilestones = courseMocktestSessions.map((sessionOrder, index) => {
    // Check if student has completed this mocktest
    const hasScore = mocktestScores.some(
      mt => mt.sessionOrder === sessionOrder
    );
    return {
      lessonNumber: sessionOrder,
      status: hasScore ? 'completed' : 'upcoming'
    };
  });

  return (
    <div className="p-24">
      <Row className="g-3">
        {/* LEFT COLUMN - Tiến độ học tập (8/12) */}
        <Col md={8}>
          <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-main-25 border-0 p-20">
              <h5 className="text-neutral-900 fw-semibold mb-0">
                <i className="fas fa-book-reader me-2 text-main-600"></i>
                Tiến độ học tập
              </h5>
            </Card.Header>
            <Card.Body className="p-20">
              {/* Progress Bar Section - Teacher Design */}
              <div className="mb-20">
                <div className="d-flex justify-content-between align-items-center mb-8">
                  <span className="text-neutral-700 fw-semibold text-14">Hoàn thành chương trình</span>
                  <span className="text-main-600 fw-bold text-16">
                    {completedLessons}/{totalLessons} buổi ({progressPercentage}%)
                  </span>
                </div>
                
                {/* Progress Bar Container with Mocktest Milestones */}
                <div style={{ position: 'relative' }}>
                  <ProgressBar 
                    now={progressPercentage}
                    className="rounded-pill"
                    style={{ height: '24px', backgroundColor: '#E5E7EB' }}
                    variant="primary"
                  />
                  
                  {/* Mocktest Milestones */}
                  {mocktestMilestones.length > 0 && mocktestMilestones.map((milestone, index) => {
                    const position = totalLessons > 0 
                      ? (milestone.lessonNumber / totalLessons) * 100 
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
                
                {/* Mocktest Legend */}
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
              </div>

              {/* Attendance Alert */}
              {shouldAlertAttendance && (
                <Alert variant="warning" className="mb-20 py-12 px-16 text-13">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Lưu ý:</strong> Tỷ lệ vắng mặt đạt {absentPercentage}%. Hãy đi học chăm chỉ hơn để đảm bảo kết quả đầu ra!
                </Alert>
              )}

              {/* Absence Statistics */}
              <div className="mb-20 pb-16" style={{ borderBottom: '1px solid #E5E7EB' }}>
                <div className="d-flex justify-content-between align-items-center mb-12">
                  <h6 className="text-neutral-700 fw-semibold mb-0 text-14">
                    <i className="fas fa-calendar-times me-2 text-danger-600"></i>
                    Thống kê vắng mặt
                  </h6>
                  <Badge bg={absentPercentage >= 20 ? 'danger' : absentPercentage >= 10 ? 'warning' : absentPercentage > 0 ? 'danger' : 'success'} className="px-10 py-4">
                    {absentPercentage}% ({absentLessons}/{totalLessons} buổi)
                  </Badge>
                </div>
              </div>

              {/* Two Column Layout: Absent Lessons + Mocktest Scores */}
              {/* Absent Lessons List - Full Width */}
              <div className="mb-20">
                <h6 className="text-neutral-700 fw-semibold mb-12 text-14">
                  Danh sách buổi nghỉ
                </h6>
                {absentLessonsList.length === 0 ? (
                  <div className="text-center py-20 bg-success-25 rounded-8">
                    <i className="fas fa-check-circle text-success-600 mb-2" style={{ fontSize: '32px' }}></i>
                    <p className="text-success-700 mb-0 text-13 fw-semibold">Chưa nghỉ buổi nào. Tuyệt vời!</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <div className="d-flex flex-column gap-2">
                      {absentLessonsList.map((lesson, index) => (
                        <div 
                          key={index}
                          className="d-flex justify-content-between align-items-center p-12 bg-danger-25 border border-danger-100 rounded-8"
                        >
                          <div className="d-flex align-items-center gap-10">
                            <span className="text-neutral-700 text-13 fw-medium">Buổi {lesson.lessonNumber}</span>
                          </div>
                          <span className="text-neutral-600 text-12">
                            <i className="fas fa-clock me-1"></i>
                            {new Date(lesson.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mocktest Scores - Full Width */}
              <div>
                <h6 className="text-neutral-700 fw-semibold mb-12 text-14">
                  Điểm Mocktest
                </h6>
                {mocktestScores.length === 0 ? (
                  <div className="text-center py-20 bg-neutral-50 rounded-8">
                    <i className="fas fa-clipboard-list text-neutral-300 mb-2" style={{ fontSize: '32px' }}></i>
                    <p className="text-neutral-500 mb-0 text-13">Chưa có điểm Mocktest</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <div className="d-flex flex-column gap-3">
                      {mocktestScores.map((mocktest, index) => (
                        <div 
                          key={index}
                          className="p-16 bg-info-25 border border-info-100 rounded-8"
                        >
                          <div className="d-flex justify-content-between align-items-center mb-12">
                            <div className="d-flex align-items-center gap-10">
                              <span className="text-neutral-900 text-14 fw-semibold">{mocktest.title || `Mocktest ${mocktest.mocktestNumber}`}</span>
                            </div>
                            <Badge bg="success" className="px-12 py-6 text-13 fw-bold">
                              Band: {mocktest.totalScore || 'N/A'}
                            </Badge>
                          </div>
                          {mocktest.skillScores && (
                            <div className="d-flex flex-wrap gap-2">
                              {mocktest.skillScores.reading !== undefined && (
                                <Badge bg="primary" className="px-10 py-6 text-12 d-flex align-items-center gap-1">
                                  <i className="fas fa-book"></i>
                                  Reading: {mocktest.skillScores.reading}
                                </Badge>
                              )}
                              {mocktest.skillScores.listening !== undefined && (
                                <Badge bg="primary" className="px-10 py-6 text-12 d-flex align-items-center gap-1">
                                  <i className="fas fa-headphones"></i>
                                  Listening: {mocktest.skillScores.listening}
                                </Badge>
                              )}
                              {mocktest.skillScores.writing !== undefined && (
                                <Badge bg="primary" className="px-10 py-6 text-12 d-flex align-items-center gap-1">
                                  <i className="fas fa-pen"></i>
                                  Writing: {mocktest.skillScores.writing}
                                </Badge>
                              )}
                              {mocktest.skillScores.speaking !== undefined && (
                                <Badge bg="primary" className="px-10 py-6 text-12 d-flex align-items-center gap-1">
                                  <i className="fas fa-microphone"></i>
                                  Speaking: {mocktest.skillScores.speaking}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COLUMN - Hoàn thành bài tập (4/12) */}
        <Col md={4}>
          <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-success-25 border-0 p-20">
              <h5 className="text-neutral-900 fw-semibold mb-0">
                <i className="fas fa-tasks me-2 text-success-600"></i>
                Hoàn thành bài tập
              </h5>
            </Card.Header>
            <Card.Body className="p-20">
              {/* Homework Completion Summary */}
              {totalHomework === 0 ? (
                <div className="text-center py-32">
                  <i className="fas fa-clipboard-list text-neutral-300 mb-2" style={{ fontSize: '48px' }}></i>
                  <p className="text-neutral-500 mb-0 text-14">Chưa có bài tập nào</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-20 pb-16" style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <div className="text-success-600 text-40 fw-bold mb-2">
                      {completedHomework}/{totalHomework}
                    </div>
                    <div className="text-neutral-700 text-13">bài tập đã hoàn thành</div>
                  </div>

                  {/* Late Homework Alert */}
                  {shouldAlertHomework && (
                    <Alert variant="warning" className="mb-16 py-10 px-12 text-12">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      <strong>Lưu ý:</strong> {latePercentage}% bài tập nộp muộn. Hãy hoàn thành bài tập đúng hạn!
                    </Alert>
                  )}

                  {/* Incomplete Homework */}
                  <div className="mb-16">
                    <h6 className="text-neutral-700 fw-semibold mb-10 text-13">
                      <i className="fas fa-times-circle me-2 text-danger-600"></i>
                      Chưa nộp ({incompleteHomework.length})
                    </h6>
                    {incompleteHomework.length === 0 ? (
                      <div className="text-center py-12 bg-success-25 rounded-6">
                        <span className="text-success-700 text-11 fw-semibold">Không có bài chưa nộp</span>
                      </div>
                    ) : (
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <div className="d-flex flex-column gap-2">
                          {incompleteHomework.map((hw, index) => (
                            <div key={index} className="p-10 bg-danger-25 border border-danger-100 rounded-6">
                              <div className="text-neutral-900 fw-semibold text-12 mb-4">
                                {hw.title}
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-neutral-600 text-11">
                                  <i className="fas fa-book-reader me-1"></i>
                                  Buổi {hw.lessonNumber}
                                </span>
                                <span className="text-danger-600 text-10 fw-medium">
                                  <i className="fas fa-clock me-1"></i>
                                  {new Date(hw.deadline).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Late Homework */}
                  <div>
                    <h6 className="text-neutral-700 fw-semibold mb-10 text-13">
                      <i className="fas fa-exclamation-circle me-2 text-warning-600"></i>
                      Nộp muộn ({lateHomeworkList.length})
                    </h6>
                    {lateHomeworkList.length === 0 ? (
                      <div className="text-center py-12 bg-success-25 rounded-6">
                        <span className="text-success-700 text-11 fw-semibold">Không có bài nộp muộn</span>
                      </div>
                    ) : (
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <div className="d-flex flex-column gap-2">
                          {lateHomeworkList.map((hw, index) => (
                            <div key={index} className="p-10 bg-warning-25 border border-warning-100 rounded-6">
                              <div className="text-neutral-900 fw-semibold text-12 mb-4">
                                {hw.title}
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-neutral-600 text-11">
                                  <i className="fas fa-book-reader me-1"></i>
                                  Buổi {hw.lessonNumber}
                                </span>
                                <span className="text-warning-600 text-10 fw-medium">
                                  <i className="fas fa-clock me-1"></i>
                                  {new Date(hw.deadline).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Late Homework Percentage Badge */}
                  {lateHomework > 0 && (
                    <div className="mt-16 text-center">
                      <Badge bg={latePercentage >= 20 ? 'danger' : 'warning'} className="px-12 py-6 text-12">
                        Tỷ lệ nộp muộn: {latePercentage}%
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClassProgress;
