import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Table, Tabs, Tab } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import StudentNavigation from './StudentNavigation';
import ToeicBreadcrumb from './ToeicBreadcrumb';
import { getToeicResultMock } from './student_mockdata';

/**
 * TOEIC Test Result - Xem kết quả và giải thích đáp án
 */
const ToeicTestResult = () => {
  const { testId } = useParams();
  
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPart, setSelectedPart] = useState(null);

  const fetchResult = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await toeicApi.getTestResult(testId);
      // setResult(response.data);
      
      // Using mock data
      const mockData = getToeicResultMock(testId);
      setResult(mockData);
    } catch (error) {
      console.error('Error fetching result:', error);
    }
  }, [testId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  const getScoreBadgeColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  if (!result) {
    return (
      <div className="d-flex">
        <StudentNavigation />
        <div className="flex-grow-1" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
          <Container className="py-60">
            <div className="text-center">
              <div className="spinner-border text-main-600 mb-16" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-neutral-600">Đang tải kết quả...</p>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <StudentNavigation />
      <div className="flex-grow-1" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
        <Container fluid className="py-24 px-24">
          {/* Breadcrumb */}
          <ToeicBreadcrumb currentPage="Kết quả bài thi" testTitle={result.testTitle} />

          {/* Header */}
          <Card className="border-0 rounded-16 mb-24"
                style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-32">
              <Row className="align-items-center">
                <Col lg={8}>
                  <Badge className="bg-white text-success-600 px-16 py-8 mb-16">
                    <i className="fas fa-check-circle me-2"></i>
                    Hoàn thành
                  </Badge>
                  <h3 className="text-white fw-bold mb-12">{result.testTitle}</h3>
                  <div className="d-flex flex-wrap gap-16 text-white" style={{ opacity: 0.95 }}>
                    <span>
                      <i className="fas fa-calendar-alt me-2"></i>
                      {new Date(result.attemptDate).toLocaleDateString('vi-VN')}
                    </span>
                    <span>
                      <i className="fas fa-clock me-2"></i>
                      Thời gian: {result.timeSpent} phút
                    </span>
                  </div>
                </Col>
                <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
                  <Link to={`/student/toeic/test/${testId}`}>
                <Button className="btn-white text-success-600 fw-semibold px-24 py-12 me-2">
                  <i className="fas fa-redo me-2"></i>
                  Làm lại
                </Button>
              </Link>
              <Link to="/student/toeic">
                <Button className="btn-outline-white fw-semibold px-24 py-12">
                  <i className="fas fa-arrow-left me-2"></i>
                  Quay lại
                </Button>
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Score Overview */}
      <Row className="g-3 mb-24">
        <Col md={4}>
          <Card className="bg-white border-0 rounded-16 h- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}100">
            <Card.Body className="text-center p-32">
              <div className="mb-20">
                <div className="bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mx-auto"
                     style={{ 
                       width: '120px', 
                       height: '120px',
                       background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                     }}>
                  <div className="text-center">
                    <div className="text-white fw-bold" style={{ fontSize: '36px' }}>
                      {result.scores.total}
                    </div>
                    <div className="text-white text-14" style={{ opacity: 0.9 }}>/ 990</div>
                  </div>
                </div>
              </div>
              <h5 className="text-neutral-900 fw-bold mb-8">Tổng điểm</h5>
              <Badge className={`bg-${getScoreBadgeColor(result.scores.total, result.scores.maxTotal)}-100 text-${getScoreBadgeColor(result.scores.total, result.scores.maxTotal)}-600 px-16 py-8 text-14`}>
                {((result.scores.total / result.scores.maxTotal) * 100).toFixed(1)}%
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="bg-white border-0 rounded-16 h- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}100">
            <Card.Body className="text-center p-32">
              <div className="mb-20">
                <div className="bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mx-auto"
                     style={{ 
                       width: '120px', 
                       height: '120px',
                       background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                     }}>
                  <div className="text-center">
                    <div className="text-white fw-bold" style={{ fontSize: '36px' }}>
                      {result.scores.listening.score}
                    </div>
                    <div className="text-white text-14" style={{ opacity: 0.9 }}>/ 495</div>
                  </div>
                </div>
              </div>
              <h5 className="text-neutral-900 fw-bold mb-8">
                <i className="fas fa-headphones text-info-500 me-2"></i>
                Listening
              </h5>
              <div className="text-neutral-600 text-14">
                Đúng: {result.scores.listening.correct}/{result.scores.listening.total}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="bg-white border-0 rounded-16 h- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}100">
            <Card.Body className="text-center p-32">
              <div className="mb-20">
                <div className="bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mx-auto"
                     style={{ 
                       width: '120px', 
                       height: '120px',
                       background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                     }}>
                  <div className="text-center">
                    <div className="text-white fw-bold" style={{ fontSize: '36px' }}>
                      {result.scores.reading.score}
                    </div>
                    <div className="text-white text-14" style={{ opacity: 0.9 }}>/ 495</div>
                  </div>
                </div>
              </div>
              <h5 className="text-neutral-900 fw-bold mb-8">
                <i className="fas fa-book-open text-warning-600 me-2"></i>
                Reading
              </h5>
              <div className="text-neutral-600 text-14">
                Đúng: {result.scores.reading.correct}/{result.scores.reading.total}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Results */}
      <Card className="bg-white border-0 rounded-16 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
        <Card.Body className="p-24">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-24"
          >
            {/* Overview Tab */}
            <Tab eventKey="overview" title={<><i className="fas fa-chart-pie me-2"></i>Tổng quan</>}>
              <Row className="g-3">
                {/* Part Scores */}
                <Col md={8}>
                  <h6 className="text-neutral-900 fw-bold mb-16">Điểm theo từng Part</h6>
                  {result.partScores.map(part => (
                    <div key={part.part} className="mb-16">
                      <div className="d-flex justify-content-between mb-8">
                        <span className="text-neutral-800 fw-medium">
                          Part {part.part}: {part.name}
                        </span>
                        <span className="text-neutral-600">
                          {part.correct}/{part.total} ({part.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <ProgressBar>
                        <ProgressBar 
                          variant={getPercentageColor(part.percentage)} 
                          now={part.percentage} 
                          key={1}
                        />
                      </ProgressBar>
                    </div>
                  ))}
                </Col>

                {/* Insights */}
                <Col md={4}>
                  <Card className="bg-success-50 border-success-200 border-2 mb-16">
                    <Card.Body className="p-16">
                      <h6 className="text-success-600 fw-bold mb-12">
                        <i className="fas fa-thumbs-up me-2"></i>
                        Điểm mạnh
                      </h6>
                      <ul className="mb-0 ps-16">
                        {result.insights.strengths.map((item, index) => (
                          <li key={index} className="text-success-700 text-13 mb-6">{item}</li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>

                  <Card className="bg-warning-50 border-warning-200 border-2 mb-16">
                    <Card.Body className="p-16">
                      <h6 className="text-warning-600 fw-bold mb-12">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Cần cải thiện
                      </h6>
                      <ul className="mb-0 ps-16">
                        {result.insights.weaknesses.map((item, index) => (
                          <li key={index} className="text-warning-700 text-13 mb-6">{item}</li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>

                  <Card className="bg-info-50 border-info-200 border-2">
                    <Card.Body className="p-16">
                      <h6 className="text-info-600 fw-bold mb-12">
                        <i className="fas fa-lightbulb me-2"></i>
                        Gợi ý
                      </h6>
                      <ul className="mb-0 ps-16">
                        {result.insights.recommendations.map((item, index) => (
                          <li key={index} className="text-info-700 text-13 mb-6">{item}</li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            {/* Detailed Answers Tab */}
            <Tab eventKey="answers" title={<><i className="fas fa-list-ul me-2"></i>Chi tiết đáp án</>}>
              {/* Part Filter */}
              <div className="d-flex flex-wrap gap-2 mb-20">
                <Button
                  size="sm"
                  className={selectedPart === null ? 'btn-main' : 'btn-outline-main'}
                  onClick={() => setSelectedPart(null)}
                >
                  Tất cả
                </Button>
                {[1, 2, 3, 4, 5, 6, 7].map(part => (
                  <Button
                    key={part}
                    size="sm"
                    className={selectedPart === part ? 'btn-main' : 'btn-outline-main'}
                    onClick={() => setSelectedPart(part)}
                  >
                    Part {part}
                  </Button>
                ))}
              </div>

              {/* Answers Table */}
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="text-center" style={{ width: '80px' }}>Câu</th>
                      <th className="text-center" style={{ width: '80px' }}>Part</th>
                      <th className="text-center" style={{ width: '100px' }}>Đáp án</th>
                      <th className="text-center" style={{ width: '100px' }}>Bạn chọn</th>
                      <th className="text-center" style={{ width: '100px' }}>Kết quả</th>
                      <th>Giải thích</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.answers
                      .filter(answer => selectedPart === null || answer.part === selectedPart)
                      .map(answer => (
                        <tr key={answer.questionId} className={answer.isCorrect ? '' : 'table-danger'}>
                          <td className="text-center fw-bold">{answer.questionId}</td>
                          <td className="text-center">
                            <Badge className="bg-neutral-200 text-neutral-800">Part {answer.part}</Badge>
                          </td>
                          <td className="text-center fw-bold text-success-600">{answer.correctAnswer}</td>
                          <td className="text-center fw-bold">{answer.userAnswer || '-'}</td>
                          <td className="text-center">
                            {answer.isCorrect ? (
                              <i className="fas fa-check-circle text-success-600 fa-lg"></i>
                            ) : (
                              <i className="fas fa-times-circle text-danger-600 fa-lg"></i>
                            )}
                          </td>
                          <td>
                            <span className="text-neutral-700 text-14">{answer.explanation}</span>
                            {answer.audioUrl && (
                              <Button size="sm" className="btn-outline-main ms-8 py-4 px-12">
                                <i className="fas fa-volume-up me-1"></i>
                                Nghe lại
                              </Button>
                            )}
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
    </Container>
      </div>
    </div>
  );
};

export default ToeicTestResult;
