import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StudentNavigation from './StudentNavigation';
import ToeicBreadcrumb from './ToeicBreadcrumb';

/**
 * TOEIC Practice - Danh sách đề thi luyện tập
 */
const ToeicPractice = () => {
  const [tests, setTests] = useState([]);
  const [filter, setFilter] = useState('all'); // all, listening, reading, full
  const [statusFilter, setStatusFilter] = useState('all'); // all, completed, new
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scoreHistory, setScoreHistory] = useState([]);
  const testsPerPage = 5;

  useEffect(() => {
    fetchTests();
    fetchStats();
    fetchScoreHistory();
  }, []);

  const fetchTests = async () => {
    try {
      // TODO: Replace with actual API call
      // Mock data with more tests
      setTests([
        {
          id: 1,
          title: 'TOEIC Practice Test 1 - Full',
          type: 'full',
          description: 'Đề thi đầy đủ 2 kỹ năng Listening và Reading',
          level: 'Intermediate',
          totalQuestions: 200,
          listeningQuestions: 100,
          readingQuestions: 100,
          duration: 120, // minutes
          attempts: 3,
          bestScore: 805,
          lastAttempt: '2025-11-01',
          status: 'completed',
          thumbnail: 'https://via.placeholder.com/300x200?text=TOEIC+Test+1'
        },
        {
          id: 2,
          title: 'TOEIC Listening Practice 1',
          type: 'listening',
          description: 'Luyện tập chuyên sâu kỹ năng Listening',
          level: 'Intermediate',
          totalQuestions: 100,
          listeningQuestions: 100,
          readingQuestions: 0,
          duration: 45,
          attempts: 2,
          bestScore: 385,
          lastAttempt: '2025-10-28',
          status: 'completed',
          thumbnail: 'https://via.placeholder.com/300x200?text=Listening'
        },
        {
          id: 3,
          title: 'TOEIC Reading Practice 1',
          type: 'reading',
          description: 'Luyện tập chuyên sâu kỹ năng Reading',
          level: 'Intermediate',
          totalQuestions: 100,
          listeningQuestions: 0,
          readingQuestions: 100,
          duration: 75,
          attempts: 2,
          bestScore: 420,
          lastAttempt: '2025-10-25',
          status: 'completed',
          thumbnail: 'https://via.placeholder.com/300x200?text=Reading'
        },
        {
          id: 4,
          title: 'TOEIC Practice Test 2 - Full',
          type: 'full',
          description: 'Đề thi mô phỏng thực tế',
          level: 'Advanced',
          totalQuestions: 200,
          listeningQuestions: 100,
          readingQuestions: 100,
          duration: 120,
          attempts: 1,
          bestScore: 750,
          lastAttempt: '2025-10-20',
          status: 'completed',
          thumbnail: 'https://via.placeholder.com/300x200?text=TOEIC+Test+2'
        },
        {
          id: 5,
          title: 'TOEIC Listening Practice 2',
          type: 'listening',
          description: 'Part 3-4: Conversations & Talks',
          level: 'Advanced',
          totalQuestions: 100,
          listeningQuestions: 100,
          readingQuestions: 0,
          duration: 45,
          attempts: 1,
          bestScore: 360,
          lastAttempt: '2025-10-15',
          status: 'completed',
          thumbnail: 'https://via.placeholder.com/300x200?text=Listening+2'
        },
        {
          id: 6,
          title: 'TOEIC Reading Practice 2',
          type: 'reading',
          description: 'Part 5-7: Grammar & Reading Comprehension',
          level: 'Advanced',
          totalQuestions: 100,
          listeningQuestions: 0,
          readingQuestions: 100,
          duration: 75,
          attempts: 0,
          bestScore: null,
          lastAttempt: null,
          status: 'new',
          thumbnail: 'https://via.placeholder.com/300x200?text=Reading+2'
        },
        {
          id: 7,
          title: 'TOEIC Practice Test 3 - Full',
          type: 'full',
          description: 'Đề thi nâng cao cho mục tiêu 850+',
          level: 'Advanced',
          totalQuestions: 200,
          listeningQuestions: 100,
          readingQuestions: 100,
          duration: 120,
          attempts: 0,
          bestScore: null,
          lastAttempt: null,
          status: 'new',
          thumbnail: 'https://via.placeholder.com/300x200?text=TOEIC+Test+3'
        },
        {
          id: 8,
          title: 'TOEIC Listening Practice 3',
          type: 'listening',
          description: 'Part 1-2: Photographs & Question-Response',
          level: 'Beginner',
          totalQuestions: 100,
          listeningQuestions: 100,
          readingQuestions: 0,
          duration: 45,
          attempts: 0,
          bestScore: null,
          lastAttempt: null,
          status: 'new',
          thumbnail: 'https://via.placeholder.com/300x200?text=Listening+3'
        },
        {
          id: 9,
          title: 'TOEIC Reading Practice 3',
          type: 'reading',
          description: 'Part 6-7: Text Completion & Reading',
          level: 'Beginner',
          totalQuestions: 100,
          listeningQuestions: 0,
          readingQuestions: 100,
          duration: 75,
          attempts: 0,
          bestScore: null,
          lastAttempt: null,
          status: 'new',
          thumbnail: 'https://via.placeholder.com/300x200?text=Reading+3'
        },
        {
          id: 10,
          title: 'TOEIC Practice Test 4 - Full',
          type: 'full',
          description: 'Đề thi thử với độ khó tương đương ETS',
          level: 'Intermediate',
          totalQuestions: 200,
          listeningQuestions: 100,
          readingQuestions: 100,
          duration: 120,
          attempts: 0,
          bestScore: null,
          lastAttempt: null,
          status: 'new',
          thumbnail: 'https://via.placeholder.com/300x200?text=TOEIC+Test+4'
        },
        {
          id: 11,
          title: 'TOEIC Listening Practice 4',
          type: 'listening',
          description: 'Luyện nghe toàn diện các Part 1-4',
          level: 'Intermediate',
          totalQuestions: 100,
          listeningQuestions: 100,
          readingQuestions: 0,
          duration: 45,
          attempts: 0,
          bestScore: null,
          lastAttempt: null,
          status: 'new',
          thumbnail: 'https://via.placeholder.com/300x200?text=Listening+4'
        },
        {
          id: 12,
          title: 'TOEIC Reading Practice 4',
          type: 'reading',
          description: 'Đọc hiểu nâng cao với bài văn dài',
          level: 'Advanced',
          totalQuestions: 100,
          listeningQuestions: 0,
          readingQuestions: 100,
          duration: 75,
          attempts: 0,
          bestScore: null,
          lastAttempt: null,
          status: 'new',
          thumbnail: 'https://via.placeholder.com/300x200?text=Reading+4'
        }
      ]);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // TODO: API call
      setStats({
        totalTests: 12,
        completedTests: 5,
        averageScore: 564,
        bestScore: 805,
        totalTime: 450 // minutes
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchScoreHistory = async () => {
    try {
      // TODO: API call
      // Mock score progression data
      setScoreHistory([
        { date: '15/10', score: 650 },
        { date: '20/10', score: 750 },
        { date: '25/10', score: 720 },
        { date: '28/10', score: 770 },
        { date: '01/11', score: 805 }
      ]);
    } catch (error) {
      console.error('Error fetching score history:', error);
    }
  };

  const getFilteredTests = () => {
    return tests
      .filter(test => {
        // Type filter
        if (filter !== 'all' && test.type !== filter) return false;
        
        // Status filter
        if (statusFilter === 'completed' && test.attempts === 0) return false;
        if (statusFilter === 'new' && test.attempts > 0) return false;
        
        // Search filter
        if (searchTerm && !test.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !test.description.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        return true;
      });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'full': return 'fa-clipboard-list';
      case 'listening': return 'fa-headphones';
      case 'reading': return 'fa-book-open';
      default: return 'fa-file-alt';
    }
  };

  // Pagination logic
  const filteredTests = getFilteredTests();
  const totalPages = Math.ceil(filteredTests.length / testsPerPage);
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Count tests by type
  const fullTestCount = tests.filter(t => t.type === 'full').length;
  const listeningTestCount = tests.filter(t => t.type === 'listening').length;
  const readingTestCount = tests.filter(t => t.type === 'reading').length;
  const completedTestCount = tests.filter(t => t.attempts > 0).length;
  const newTestCount = tests.filter(t => t.attempts === 0).length;

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#F5F7FA' }}>
        <Container fluid className="p-0">
          {/* Header with Breadcrumb */}
          <div className="bg-white border-bottom border-neutral-200 py-20 px-32">
            <ToeicBreadcrumb />
            <h4 className="text-neutral-900 fw-bold mb-8">
              <i className="fas fa-graduation-cap text-main-600 me-2"></i>
              Luyện thi TOEIC
            </h4>
            <p className="text-neutral-600 mb-0 text-14">
              Rèn luyện kỹ năng Listening và Reading
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white border-bottom border-neutral-100 py-16 px-32">
            <Row className="align-items-center mb-12">
              <Col lg={8}>
                <div className="mb-8">
                  <span className="text-neutral-600 text-12 fw-medium me-2">Loại đề thi:</span>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className={filter === 'all' ? 'btn-main' : 'filter-btn-all'}
                    onClick={() => { setFilter('all'); setCurrentPage(1); }}
                  >
                    <i className="fas fa-th me-1"></i>
                    Tất cả ({tests.length})
                  </Button>
                  <Button
                    size="sm"
                    className={filter === 'full' ? 'filter-btn-full active' : 'filter-btn-full'}
                    onClick={() => { setFilter('full'); setCurrentPage(1); }}
                  >
                    <i className="fas fa-clipboard-list me-1"></i>
                    Full Test ({fullTestCount})
                  </Button>
                  <Button
                    size="sm"
                    className={filter === 'listening' ? 'filter-btn-listening active' : 'filter-btn-listening'}
                    onClick={() => { setFilter('listening'); setCurrentPage(1); }}
                  >
                    <i className="fas fa-headphones me-1"></i>
                    Listening ({listeningTestCount})
                  </Button>
                  <Button
                    size="sm"
                    className={filter === 'reading' ? 'filter-btn-reading active' : 'filter-btn-reading'}
                    onClick={() => { setFilter('reading'); setCurrentPage(1); }}
                  >
                    <i className="fas fa-book-open me-1"></i>
                    Reading ({readingTestCount})
                  </Button>
                </div>
              </Col>
              <Col lg={4} className="mt-2 mt-lg-0">
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm đề thi..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="border-neutral-300"
                  size="sm"
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <div className="mb-4">
                  <span className="text-neutral-600 text-12 fw-medium me-2">Trạng thái:</span>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className={statusFilter === 'all' ? 'filter-btn-secondary active' : 'filter-btn-secondary'}
                    onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                  >
                    <i className="fas fa-list me-1"></i>
                    Tất cả ({tests.length})
                  </Button>
                  <Button
                    size="sm"
                    className={statusFilter === 'completed' ? 'filter-btn-success active' : 'filter-btn-success'}
                    onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }}
                  >
                    <i className="fas fa-check-circle me-1"></i>
                    Đã làm ({completedTestCount})
                  </Button>
                  <Button
                    size="sm"
                    className={statusFilter === 'new' ? 'filter-btn-primary active' : 'filter-btn-primary'}
                    onClick={() => { setStatusFilter('new'); setCurrentPage(1); }}
                  >
                    <i className="fas fa-star me-1"></i>
                    Chưa làm ({newTestCount})
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          {/* Main Content Area - 2 Columns */}
          <Container fluid className="py-24 px-32">
            <Row className="g-3">
              {/* Left Column - Tests List */}
              <Col lg={9}>
        <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead className="bg-neutral-50">
                <tr>
                  <th style={{ width: '5%' }} className="text-center py-16 px-20">
                    <i className="fas fa-hashtag text-neutral-600"></i>
                  </th>
                  <th style={{ width: '35%' }} className="py-16 px-20">Đề thi</th>
                  <th style={{ width: '15%' }} className="text-center py-16 px-20">Loại</th>
                  <th style={{ width: '12%' }} className="text-center py-16 px-20">Số câu</th>
                  <th style={{ width: '10%' }} className="text-center py-16 px-20">Thời gian</th>
                  <th style={{ width: '13%' }} className="text-center py-16 px-20">Lịch sử</th>
                  <th style={{ width: '10%' }} className="text-center py-16 px-20">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentTests.map((test, index) => {
                  const typeColor = test.type === 'full' ? '#8B5CF6' : 
                                   test.type === 'listening' ? '#3B82F6' : '#F59E0B';
                  const displayIndex = indexOfFirstTest + index + 1;
                  
                  return (
                    <tr key={test.id} className="align-middle">
                      {/* Index */}
                      <td className="text-center fw-bold text-neutral-700 px-20">
                        {displayIndex}
                      </td>

                      {/* Test Info */}
                      <td className="px-20">
                        <div className="d-flex align-items-center gap-12">
                          <div 
                            className="rounded-12 d-flex align-items-center justify-content-center text-white"
                            style={{ 
                              width: '48px', 
                              height: '48px', 
                              minWidth: '48px',
                              background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}dd 100%)`
                            }}
                          >
                            <i className={`fas ${getTypeIcon(test.type)} fa-lg`}></i>
                          </div>
                          <div>
                            <h6 className="text-neutral-900 fw-semibold mb-4 text-14">
                              {test.title}
                            </h6>
                            <p className="text-neutral-600 mb-0 text-12">
                              {test.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="text-center px-20">
                        <Badge 
                          className="px-12 py-6 text-12 fw-semibold text-white"
                          style={{ 
                            backgroundColor: typeColor,
                            border: `1px solid ${typeColor}`
                          }}
                        >
                          {test.type === 'full' && <><i className="fas fa-clipboard-list me-1"></i>Full Test</>}
                          {test.type === 'listening' && <><i className="fas fa-headphones me-1"></i>Listening</>}
                          {test.type === 'reading' && <><i className="fas fa-book-open me-1"></i>Reading</>}
                        </Badge>
                      </td>

                      {/* Questions */}
                      <td className="text-center px-20">
                        <div className="text-neutral-900 fw-bold">{test.totalQuestions}</div>
                        <div className="text-neutral-500 text-11">
                          {test.type === 'full' && `L: ${test.listeningQuestions} | R: ${test.readingQuestions}`}
                          {test.type === 'listening' && 'Listening'}
                          {test.type === 'reading' && 'Reading'}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="text-center px-20">
                        <div className="text-neutral-900 fw-medium">
                          <i className="fas fa-clock text-neutral-500 me-1"></i>
                          {test.duration} phút
                        </div>
                      </td>

                      {/* History */}
                      <td className="text-center px-20">
                        {test.attempts > 0 ? (
                          <div>
                            <div className="text-success-600 fw-bold text-14">
                              {test.bestScore}
                            </div>
                            <div className="text-neutral-500 text-11">
                              {test.attempts} lần làm
                            </div>
                            <div className="text-neutral-400 text-10 mt-2">
                              {new Date(test.lastAttempt).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        ) : (
                          <Badge className="bg-neutral-200 text-neutral-600 px-10 py-6 text-11">
                            Chưa làm
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-center px-20">
                        <div className="d-flex gap-2 justify-content-center flex-nowrap">
                          <Link to={`/student/toeic/test/${test.id}`}>
                            <Button 
                              size="sm" 
                              className="btn-main text-12 fw-semibold"
                              style={{ minWidth: '90px', padding: '8px 16px' }}
                            >
                              {test.attempts > 0 ? (
                                <><i className="fas fa-redo me-1"></i>Làm lại</>
                              ) : (
                                <><i className="fas fa-play me-1"></i>Bắt đầu</>
                              )}
                            </Button>
                          </Link>
                          {test.attempts > 0 && (
                            <Link to={`/student/toeic/result/${test.id}`}>
                              <Button 
                                size="sm" 
                                className="btn-outline-main text-12 fw-semibold"
                                style={{ minWidth: '90px', padding: '8px 16px' }}
                              >
                                <i className="fas fa-chart-bar me-1"></i>Kết quả
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {currentTests.length === 0 && (
              <div className="text-center py-60">
                <i className="fas fa-search fa-3x text-neutral-300 mb-16"></i>
                <h6 className="text-neutral-600 fw-semibold mb-8">Không tìm thấy đề thi</h6>
                <p className="text-neutral-500 mb-0">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}

            {/* Pagination */}
            {filteredTests.length > testsPerPage && (
              <div className="d-flex justify-content-between align-items-center px-20 py-16 border-top">
                <div className="text-neutral-600 text-14">
                  Hiển thị {indexOfFirstTest + 1} - {Math.min(indexOfLastTest, filteredTests.length)} / {filteredTests.length} đề thi
                </div>
                <Pagination className="mb-0">
                  <Pagination.Prev 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
              </Col>

              {/* Right Column - Statistics Overview */}
              <Col lg={3}>
                <Card className="bg-white border-0 rounded-12 sticky-top" 
                      style={{ top: '20px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
                  <Card.Body className="p-20">
                    <h6 className="text-neutral-900 fw-bold mb-16 text-14">
                      <i className="fas fa-chart-line text-main-600 me-2"></i>
                      Tổng quan
                    </h6>

                    {/* Stats Grid */}
                    <div className="mb-20">
                      <div className="bg-gradient-main rounded-12 p-16 mb-12">
                        <div className="text-white text-13 mb-6">Đã hoàn thành</div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="text-white fw-bold" style={{ fontSize: '24px' }}>
                            {stats?.completedTests || 0}
                          </div>
                          <div className="text-white-50" style={{ fontSize: '18px' }}>
                            / {stats?.totalTests || 6}
                          </div>
                        </div>
                        <div className="progress bg-white-20 mt-8" style={{ height: '4px' }}>
                          <div 
                            className="progress-bar bg-white" 
                            style={{ 
                              width: `${((stats?.completedTests || 0) / (stats?.totalTests || 6)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>

                      <Row className="g-2">
                        <Col xs={6}>
                          <div className="bg-success-50 rounded-8 p-12 text-center">
                            <div className="text-success-600 fw-bold" style={{ fontSize: '20px' }}>
                              {stats?.averageScore || 0}
                            </div>
                            <div className="text-success-700 text-11 fw-medium mt-2">
                              Điểm TB
                            </div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="bg-warning-50 rounded-8 p-12 text-center">
                            <div className="text-warning-600 fw-bold" style={{ fontSize: '20px' }}>
                              {stats?.bestScore || 0}
                            </div>
                            <div className="text-warning-700 text-11 fw-medium mt-2">
                              Cao nhất
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Score Progress Chart */}
                    {scoreHistory.length > 0 && (
                      <div className="mb-16">
                        <h6 className="text-neutral-700 fw-semibold mb-10 text-13">
                          <i className="fas fa-chart-line text-neutral-500 me-1"></i>
                          Tiến độ điểm số
                        </h6>
                        <div style={{ width: '100%', height: '120px' }}>
                          <ResponsiveContainer>
                            <LineChart data={scoreHistory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 10, fill: '#6C757D' }}
                                stroke="#E9ECEF"
                              />
                              <YAxis 
                                domain={[0, 990]}
                                tick={{ fontSize: 10, fill: '#6C757D' }}
                                stroke="#E9ECEF"
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#fff', 
                                  border: '1px solid #E9ECEF',
                                  borderRadius: '8px',
                                  fontSize: '12px'
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#8B5CF6" 
                                strokeWidth={2}
                                dot={{ fill: '#8B5CF6', r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Recent Activity */}
                    <div className="mb-16">
                      <h6 className="text-neutral-700 fw-semibold mb-10 text-13">
                        <i className="fas fa-clock text-neutral-500 me-1"></i>
                        Hoạt động gần đây
                      </h6>
                      <div className="border-start border-neutral-300 ps-12 ms-6">
                        {tests.filter(t => t.attempts > 0).slice(0, 2).map((test, idx) => (
                          <div key={idx} className="mb-10 position-relative">
                            <div 
                              className="position-absolute bg-white border border-neutral-300 rounded-circle"
                              style={{ 
                                width: '8px', 
                                height: '8px', 
                                left: '-18px',
                                top: '4px'
                              }}
                            />
                            <div className="text-neutral-900 fw-medium text-12 mb-3">
                              {test.title.length > 25 ? test.title.substring(0, 25) + '...' : test.title}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg="success" className="text-10 px-6 py-2">
                                {test.bestScore}
                              </Badge>
                              <span className="text-neutral-500 text-10">
                                {new Date(test.lastAttempt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* View Full History Button */}
                    <Link to="/student/toeic/history" className="d-block">
                      <Button className="btn-outline-main w-100 text-13 fw-semibold py-10">
                        <i className="fas fa-history me-2"></i>
                        Xem chi tiết
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Container>
      </div>
    </div>
  );
};

export default ToeicPractice;
