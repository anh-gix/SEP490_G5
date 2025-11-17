import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StudentNavigation from './StudentNavigation';
import ToeicBreadcrumb from './ToeicBreadcrumb';
import { toeicHistoryMock } from './student_mockdata';

/**
 * TOEIC Test History - Lịch sử làm bài và biểu đồ tiến độ
 */
const ToeicTestHistory = () => {
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState('all'); // all, listening, reading, full
  const [sortBy, setSortBy] = useState('date'); // date, score

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await toeicApi.getTestHistory();
      // setHistory(response.data);
      
      // Using mock data
      const mockHistory = toeicHistoryMock;
      setHistory(mockHistory);
      
      // Prepare chart data
      const chartData = mockHistory
        .filter(h => h.type === 'full')
        .reverse()
        .map(h => ({
          date: new Date(h.attemptDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          'Tổng điểm': h.totalScore,
          'Listening': h.listeningScore,
          'Reading': h.readingScore
        }));
      
      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const getFilteredHistory = () => {
    let filtered = [...history];
    
    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(h => h.type === filter);
    }
    
    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.attemptDate) - new Date(a.attemptDate));
    } else if (sortBy === 'score') {
      filtered.sort((a, b) => b.totalScore - a.totalScore);
    }
    
    return filtered;
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'full': return 'fa-clipboard-list';
      case 'listening': return 'fa-headphones';
      case 'reading': return 'fa-book-open';
      default: return 'fa-file-alt';
    }
  };

  const getTypeBadge = (type) => {
    switch(type) {
      case 'full': return { bg: 'main-600', text: 'Full Test' };
      case 'listening': return { bg: 'info-500', text: 'Listening' };
      case 'reading': return { bg: 'warning-600', text: 'Reading' };
      default: return { bg: 'neutral-500', text: 'Test' };
    }
  };

  const getScoreBadge = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  // Calculate stats
  const stats = {
    totalAttempts: history.length,
    avgScore: history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.totalScore, 0) / history.length) : 0,
    bestScore: history.length > 0 ? Math.max(...history.map(h => h.totalScore)) : 0,
    totalTime: history.reduce((sum, h) => sum + h.timeSpent, 0)
  };

  return (
    <div className="d-flex">
      <StudentNavigation />
      <div className="flex-grow-1" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
        <Container fluid className="py-24 px-24">
          {/* Breadcrumb */}
          <ToeicBreadcrumb currentPage="Lịch sử làm bài" />

          {/* Header */}
          <Card className="border-0 rounded-16 mb-24"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-24">
              <Row className="align-items-center">
                <Col lg={8}>
                  <h3 className="text-white fw-bold mb-8">
                    <i className="fas fa-history me-2"></i>
                    Lịch sử làm bài
                  </h3>
                  <p className="text-white mb-0" style={{ opacity: 0.95 }}>
                    Xem lại kết quả và theo dõi tiến độ của bạn
                  </p>
                </Col>
                <Col lg={4} className="text-lg-end">
                  <Link to="/student/toeic">
                    <Button className="btn-white text-main-600 fw-semibold px-20 py-12">
                      <i className="fas fa-arrow-left me-2"></i>
                      Quay lại
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Stats */}
          <Row className="g-3 mb-24">
            <Col md={3}>
              <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
                <Card.Body className="p-20">
                  <div className="d-flex align-items-center gap-16">
                    <div className="bg-main-100 text-main-600 rounded-12 d-flex align-items-center justify-content-center"
                         style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                      <i className="fas fa-clipboard-check"></i>
                    </div>
                    <div>
                  <h4 className="text-neutral-900 fw-bold mb-0">{stats.totalAttempts}</h4>
                  <p className="text-neutral-600 mb-0 text-13">Lần làm bài</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 h- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div className="bg-success-100 text-success-600 rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                  <i className="fas fa-chart-line"></i>
                </div>
                <div>
                  <h4 className="text-neutral-900 fw-bold mb-0">{stats.avgScore}</h4>
                  <p className="text-neutral-600 mb-0 text-13">Điểm TB</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 h- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div className="bg-warning-100 text-warning-600 rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                  <i className="fas fa-star"></i>
                </div>
                <div>
                  <h4 className="text-neutral-900 fw-bold mb-0">{stats.bestScore}</h4>
                  <p className="text-neutral-600 mb-0 text-13">Cao nhất</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 h- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div className="bg-info-100 text-info-500 rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <h4 className="text-neutral-900 fw-bold mb-0">{Math.floor(stats.totalTime / 60)}h</h4>
                  <p className="text-neutral-600 mb-0 text-13">Tổng thời gian</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progress Chart */}
      {chartData.length > 0 && (
        <Card className="bg-white border-0 rounded-16 mb- style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}24">
          <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
            <h6 className="text-neutral-900 fw-bold mb-0">
              <i className="fas fa-chart-line text-main-600 me-2"></i>
              Biểu đồ tiến độ
            </h6>
          </Card.Header>
          <Card.Body className="p-24">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 990]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Tổng điểm" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="Listening" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="Reading" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      )}

      {/* Filters & History Table */}
      <Card className="bg-white border-0 rounded-16 style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}">
        <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
          <Row className="align-items-center">
            <Col md={6}>
              <h6 className="text-neutral-900 fw-bold mb-0">
                <i className="fas fa-list me-2"></i>
                Danh sách bài đã làm
              </h6>
            </Col>
            <Col md={6}>
              <Row className="g-2">
                <Col xs={6}>
                  <Form.Select 
                    size="sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border-neutral-300"
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="full">Full Test</option>
                    <option value="listening">Listening</option>
                    <option value="reading">Reading</option>
                  </Form.Select>
                </Col>
                <Col xs={6}>
                  <Form.Select 
                    size="sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border-neutral-300"
                  >
                    <option value="date">Mới nhất</option>
                    <option value="score">Điểm cao nhất</option>
                  </Form.Select>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {getFilteredHistory().length > 0 ? (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-neutral-100">
                  <tr>
                    <th style={{ width: '40%' }}>Đề thi</th>
                    <th className="text-center" style={{ width: '15%' }}>Ngày làm</th>
                    <th className="text-center" style={{ width: '15%' }}>Điểm</th>
                    <th className="text-center" style={{ width: '15%' }}>Đúng/Tổng</th>
                    <th className="text-center" style={{ width: '15%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredHistory().map(record => {
                    const typeBadge = getTypeBadge(record.type);
                    const maxScore = record.type === 'full' ? 990 : 495;
                    
                    return (
                      <tr key={record.id}>
                        <td>
                          <div className="d-flex align-items-center gap-12">
                            <div className={`bg-${typeBadge.bg} text-white rounded-8 d-flex align-items-center justify-content-center`}
                                 style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                              <i className={`fas ${getTypeIcon(record.type)}`}></i>
                            </div>
                            <div>
                              <div className="text-neutral-900 fw-semibold">{record.testTitle}</div>
                              <Badge className={`bg-${typeBadge.bg} text-white text-11 mt-4`}>
                                {typeBadge.text}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="text-center text-neutral-700">
                          {new Date(record.attemptDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="text-center">
                          <div>
                            <span className={`fw-bold text-${getScoreBadge(record.totalScore, maxScore)}-600`}>
                              {record.totalScore}
                            </span>
                            <span className="text-neutral-500"> / {maxScore}</span>
                          </div>
                          {record.type === 'full' && (
                            <div className="text-11 text-neutral-500 mt-4">
                              L: {record.listeningScore} | R: {record.readingScore}
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="text-neutral-800 fw-medium">
                            {record.correctAnswers}/{record.totalQuestions}
                          </span>
                          <div className="text-11 text-neutral-500 mt-4">
                            ({((record.correctAnswers / record.totalQuestions) * 100).toFixed(1)}%)
                          </div>
                        </td>
                        <td className="text-center">
                          <Link to={`/student/toeic/result/${record.testId}`}>
                            <Button size="sm" className="btn-outline-main px-16 py-8">
                              <i className="fas fa-eye me-1"></i>
                              Xem
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-60">
              <i className="fas fa-inbox fa-3x text-neutral-300 mb-16"></i>
              <h6 className="text-neutral-700 fw-semibold mb-8">Chưa có lịch sử</h6>
              <p className="text-neutral-500 mb-16">Bạn chưa làm bài thi nào</p>
              <Link to="/student/toeic">
                <Button className="btn-main">
                  <i className="fas fa-play me-2"></i>
                  Bắt đầu làm bài
                </Button>
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
        </div>
      </div>
    );
};

export default ToeicTestHistory;
