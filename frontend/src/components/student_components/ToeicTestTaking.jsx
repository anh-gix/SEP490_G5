import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, ProgressBar, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import ToeicBreadcrumb from './ToeicBreadcrumb';

/**
 * TOEIC Test Taking - Màn hình làm bài thi
 */
const ToeicTestTaking = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [testInfo, setTestInfo] = useState(null);
  const [currentSection, setCurrentSection] = useState('listening'); // listening, reading
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(7200); // 120 minutes in seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const handleAutoSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    alert('Hết giờ! Bài thi sẽ được tự động nộp.');
    navigate(`/student/toeic/result/${testId}`);
  }, [testId, navigate]);

  const fetchTestData = useCallback(async () => {
    try {
      // TODO: API call
      // Mock data
      setTestInfo({
        id: testId,
        title: 'TOEIC Practice Test 1',
        type: 'full',
        sections: {
          listening: {
            parts: [
              {
                partNumber: 1,
                title: 'Photographs',
                description: 'Mô tả hình ảnh',
                questionCount: 6,
                questions: Array.from({ length: 6 }, (_, i) => ({
                  id: i + 1,
                  partNumber: 1,
                  type: 'listening',
                  audioUrl: '/audio/part1-q' + (i + 1) + '.mp3',
                  imageUrl: 'https://via.placeholder.com/400x300?text=Photo+' + (i + 1),
                  options: ['A', 'B', 'C', 'D'],
                  correctAnswer: 'A' // For demo
                }))
              },
              {
                partNumber: 2,
                title: 'Question-Response',
                description: 'Hỏi - Đáp',
                questionCount: 25,
                questions: Array.from({ length: 25 }, (_, i) => ({
                  id: i + 7,
                  partNumber: 2,
                  type: 'listening',
                  audioUrl: '/audio/part2-q' + (i + 1) + '.mp3',
                  options: ['A', 'B', 'C'],
                  correctAnswer: 'B'
                }))
              },
              {
                partNumber: 3,
                title: 'Conversations',
                description: 'Đối thoại',
                questionCount: 39,
                questions: Array.from({ length: 39 }, (_, i) => ({
                  id: i + 32,
                  partNumber: 3,
                  type: 'listening',
                  audioUrl: '/audio/part3-set' + Math.floor(i / 3) + '.mp3',
                  questionText: `Question ${i + 32}: What is the main topic?`,
                  options: ['A', 'B', 'C', 'D'],
                  correctAnswer: 'C'
                }))
              },
              {
                partNumber: 4,
                title: 'Talks',
                description: 'Bài nói',
                questionCount: 30,
                questions: Array.from({ length: 30 }, (_, i) => ({
                  id: i + 71,
                  partNumber: 4,
                  type: 'listening',
                  audioUrl: '/audio/part4-set' + Math.floor(i / 3) + '.mp3',
                  questionText: `Question ${i + 71}: What is mentioned about...?`,
                  options: ['A', 'B', 'C', 'D'],
                  correctAnswer: 'D'
                }))
              }
            ]
          },
          reading: {
            parts: [
              {
                partNumber: 5,
                title: 'Incomplete Sentences',
                description: 'Hoàn thành câu',
                questionCount: 30,
                questions: Array.from({ length: 30 }, (_, i) => ({
                  id: i + 101,
                  partNumber: 5,
                  type: 'reading',
                  questionText: `The company _____ a new product next month.`,
                  options: [
                    'will launch',
                    'launching',
                    'launched',
                    'to launch'
                  ],
                  correctAnswer: 'will launch'
                }))
              },
              {
                partNumber: 6,
                title: 'Text Completion',
                description: 'Hoàn thành đoạn văn',
                questionCount: 16,
                questions: Array.from({ length: 16 }, (_, i) => ({
                  id: i + 131,
                  partNumber: 6,
                  type: 'reading',
                  passage: 'To: All Staff\nFrom: HR Department\n...',
                  questionText: `Question ${i + 131}:`,
                  options: ['A', 'B', 'C', 'D'],
                  correctAnswer: 'B'
                }))
              },
              {
                partNumber: 7,
                title: 'Reading Comprehension',
                description: 'Đọc hiểu',
                questionCount: 54,
                questions: Array.from({ length: 54 }, (_, i) => ({
                  id: i + 147,
                  partNumber: 7,
                  type: 'reading',
                  passage: 'Sample passage text here...',
                  questionText: `What is the main purpose of the passage?`,
                  options: ['A', 'B', 'C', 'D'],
                  correctAnswer: 'C'
                }))
              }
            ]
          }
        }
      });
    } catch (error) {
      console.error('Error fetching test:', error);
    }
  }, [testId]);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleAutoSubmit]);

  useEffect(() => {
    fetchTestData();
    startTimer();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchTestData, startTimer]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAllQuestions = () => {
    if (!testInfo) return [];
    const listeningQuestions = testInfo.sections.listening.parts.flatMap(part => part.questions);
    const readingQuestions = testInfo.sections.reading.parts.flatMap(part => part.questions);
    return [...listeningQuestions, ...readingQuestions];
  };

  const getCurrentSectionQuestions = () => {
    if (!testInfo) return [];
    if (currentSection === 'listening') {
      return testInfo.sections.listening.parts.flatMap(part => part.questions);
    } else {
      return testInfo.sections.reading.parts.flatMap(part => part.questions);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    const questions = getCurrentSectionQuestions();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection === 'listening') {
      setCurrentSection('reading');
      setCurrentQuestion(0);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection === 'reading') {
      const listeningQuestions = testInfo.sections.listening.parts.flatMap(part => part.questions);
      setCurrentSection('listening');
      setCurrentQuestion(listeningQuestions.length - 1);
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestion(index);
  };

  const handleSwitchSection = (section) => {
    setCurrentSection(section);
    setCurrentQuestion(0);
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // TODO: Submit to API
    const result = {
      testId: testInfo.id,
      answers: answers,
      timeSpent: 7200 - timeRemaining
    };
    console.log('Submitting:', result);
    
    // Navigate to results page
    navigate(`/student/toeic/result/${testInfo.id}`);
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigate('/student/toeic');
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercent = () => {
    const allQuestions = getAllQuestions();
    return (getAnsweredCount() / allQuestions.length) * 100;
  };

  if (!testInfo) {
    return (
      <Container className="py-60">
        <div className="text-center">
          <div className="spinner-border text-main-600 mb-16" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-neutral-600">Đang tải đề thi...</p>
        </div>
      </Container>
    );
  }

  const sectionQuestions = getCurrentSectionQuestions();
  const currentQuestionData = sectionQuestions[currentQuestion];

  return (
    <div className="toeic-test-container" style={{ backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <Container fluid className="px-24 pt-16">
        <ToeicBreadcrumb currentPage="Làm bài thi" testTitle={testInfo.title} />
      </Container>

      {/* Top Bar - Sticky */}
      <div className="bg-white sticky-top" style={{ zIndex: 1000, borderBottom: '1px solid #E9ECEF' }}>
        <Container fluid className="px-24 py-16">
          <Row className="align-items-center">
            <Col md={3}>
              <h6 className="text-neutral-900 fw-bold mb-0">
                <i className="fas fa-clipboard-list text-main-600 me-2"></i>
                {testInfo.title}
              </h6>
            </Col>
            <Col md={6} className="text-center">
              <div className="d-flex align-items-center justify-content-center gap-16">
                <Badge className={`px-16 py-8 ${timeRemaining < 600 ? 'bg-danger-600' : 'bg-main-600'} text-white`}>
                  <i className="fas fa-clock me-2"></i>
                  {formatTime(timeRemaining)}
                </Badge>
                <span className="text-neutral-600 text-14">
                  Câu {currentQuestionData?.id} / {getAllQuestions().length}
                </span>
                <Badge className="bg-success-100 text-success-600 px-16 py-8">
                  Đã trả lời: {getAnsweredCount()}/{getAllQuestions().length}
                </Badge>
              </div>
              <ProgressBar 
                now={getProgressPercent()} 
                className="mt-8 bg-neutral-200" 
                style={{ height: '4px' }}
              />
            </Col>
            <Col md={3} className="text-end">
              <Button 
                className="btn-outline-danger text-14 fw-semibold px-20 py-8 me-2"
                onClick={handleExit}
              >
                <i className="fas fa-times me-2"></i>
                Thoát
              </Button>
              <Button 
                className="btn-success text-14 fw-semibold px-20 py-8"
                onClick={handleSubmit}
              >
                <i className="fas fa-check me-2"></i>
                Nộp bài
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container fluid className="px-24 py-24">
        <Row className="g-3">
          {/* Main Content - Question */}
          <Col lg={9}>
            <Card className="bg-white border-0 rounded-16 mb-16" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
              <Card.Header className="bg-gradient border-0 p-20"
                           style={{ background: currentSection === 'listening' ? 
                                   'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' :
                                   'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-white fw-bold mb-0">
                    <i className={`fas ${currentSection === 'listening' ? 'fa-headphones' : 'fa-book-open'} me-2`}></i>
                    Part {currentQuestionData?.partNumber} - {currentSection === 'listening' ? 'Listening' : 'Reading'}
                  </h5>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      className={`${currentSection === 'listening' ? 'btn-white text-main-600' : 'btn-outline-white'}`}
                      onClick={() => handleSwitchSection('listening')}
                    >
                      <i className="fas fa-headphones me-2"></i>
                      Listening
                    </Button>
                    <Button
                      size="sm"
                      className={`${currentSection === 'reading' ? 'btn-white text-warning-600' : 'btn-outline-white'}`}
                      onClick={() => handleSwitchSection('reading')}
                    >
                      <i className="fas fa-book-open me-2"></i>
                      Reading
                    </Button>
                  </div>
                </div>
              </Card.Header>

              <Card.Body className="p-32">
                {/* Listening Question */}
                {currentSection === 'listening' && (
                  <div>
                    {currentQuestionData?.imageUrl && (
                      <div className="text-center mb-24">
                        <img 
                          src={currentQuestionData.imageUrl} 
                          alt="Question"
                          className="img-fluid rounded-12"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                    )}

                    {/* Audio Player */}
                    <div className="bg-main-50 rounded-12 p-20 mb-24">
                      <div className="d-flex align-items-center gap-16">
                        <Button
                          className="btn-main rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '56px', height: '56px' }}
                          onClick={() => {
                            if (audioRef.current) {
                              if (audioPlaying) {
                                audioRef.current.pause();
                              } else {
                                audioRef.current.play();
                              }
                              setAudioPlaying(!audioPlaying);
                            }
                          }}
                        >
                          <i className={`fas ${audioPlaying ? 'fa-pause' : 'fa-play'} fa-lg`}></i>
                        </Button>
                        <div className="flex-grow-1">
                          <div className="text-neutral-900 fw-semibold mb-8">Audio Player</div>
                          <div className="bg-neutral-300 rounded-pill" style={{ height: '6px' }}>
                            <div className="bg-main-600 rounded-pill h-100" style={{ width: '0%' }}></div>
                          </div>
                        </div>
                      </div>
                      <audio ref={audioRef} src={currentQuestionData?.audioUrl} />
                    </div>

                    {currentQuestionData?.questionText && (
                      <h6 className="text-neutral-900 fw-bold mb-20">{currentQuestionData.questionText}</h6>
                    )}
                  </div>
                )}

                {/* Reading Question */}
                {currentSection === 'reading' && (
                  <div>
                    {currentQuestionData?.passage && (
                      <div className="bg-neutral-50 rounded-12 p-24 mb-24">
                        <pre className="text-neutral-800 mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                          {currentQuestionData.passage}
                        </pre>
                      </div>
                    )}
                    <h6 className="text-neutral-900 fw-bold mb-20">
                      Question {currentQuestionData?.id}: {currentQuestionData?.questionText}
                    </h6>
                  </div>
                )}

                {/* Answer Options */}
                <div className="d-flex flex-column gap-12">
                  {currentQuestionData?.options.map((option, index) => {
                    const optionLabel = typeof option === 'string' && option.length === 1 ? option : String.fromCharCode(65 + index);
                    const optionText = typeof option === 'string' && option.length > 1 ? option : option;
                    const isSelected = answers[currentQuestionData.id] === (typeof option === 'string' && option.length > 1 ? option : optionLabel);
                    
                    return (
                      <Card
                        key={index}
                        className={`border-2 transition-2 cursor-pointer ${
                          isSelected ? 'border-main-600 bg-main-50' : 'border-neutral-200 bg-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleAnswerSelect(currentQuestionData.id, typeof option === 'string' && option.length > 1 ? option : optionLabel)}
                      >
                        <Card.Body className="p-20">
                          <div className="d-flex align-items-center gap-16">
                            <div 
                              className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                                isSelected ? 'bg-main-600 text-white' : 'bg-neutral-200 text-neutral-700'
                              }`}
                              style={{ width: '40px', height: '40px', minWidth: '40px' }}
                            >
                              {optionLabel}
                            </div>
                            <span className={`${isSelected ? 'text-main-600 fw-semibold' : 'text-neutral-800'}`}>
                              {optionText}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              </Card.Body>

              {/* Navigation */}
              <Card.Footer className="bg-white border-top border-neutral-100 p-20">
                <div className="d-flex justify-content-between">
                  <Button
                    className="btn-outline-main text-14 fw-semibold px-24 py-12"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0 && currentSection === 'listening'}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Câu trước
                  </Button>
                  <Button
                    className="btn-main text-14 fw-semibold px-24 py-12"
                    onClick={handleNextQuestion}
                    disabled={currentQuestion === sectionQuestions.length - 1 && currentSection === 'reading'}
                  >
                    Câu sau
                    <i className="fas fa-arrow-right ms-2"></i>
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Sidebar - Question Grid */}
          <Col lg={3}>
            <Card className="bg-white border-0 rounded-16 sticky-top" style={{ top: '100px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
              <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
                <h6 className="text-neutral-900 fw-bold mb-0">
                  <i className="fas fa-th me-2"></i>
                  Danh sách câu hỏi
                </h6>
              </Card.Header>
              <Card.Body className="p-16" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {/* Listening Questions */}
                <div className="mb-20">
                  <div className="d-flex align-items-center gap-8 mb-12">
                    <i className="fas fa-headphones text-info-500"></i>
                    <span className="text-neutral-700 fw-semibold text-13">Listening (1-100)</span>
                  </div>
                  <div className="d-flex flex-wrap gap-6">
                    {testInfo.sections.listening.parts.flatMap(part => part.questions).map((q, index) => {
                      const isAnswered = answers[q.id];
                      const isCurrent = currentSection === 'listening' && currentQuestion === index;
                      return (
                        <Button
                          key={q.id}
                          size="sm"
                          className={`${
                            isCurrent ? 'btn-main' :
                            isAnswered ? 'btn-success' :
                            'btn-outline-main'
                          }`}
                          style={{ width: '36px', height: '36px', padding: '0', fontSize: '12px' }}
                          onClick={() => {
                            setCurrentSection('listening');
                            handleQuestionJump(index);
                          }}
                        >
                          {q.id}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Reading Questions */}
                <div>
                  <div className="d-flex align-items-center gap-8 mb-12">
                    <i className="fas fa-book-open text-warning-600"></i>
                    <span className="text-neutral-700 fw-semibold text-13">Reading (101-200)</span>
                  </div>
                  <div className="d-flex flex-wrap gap-6">
                    {testInfo.sections.reading.parts.flatMap(part => part.questions).map((q, index) => {
                      const isAnswered = answers[q.id];
                      const isCurrent = currentSection === 'reading' && currentQuestion === index;
                      return (
                        <Button
                          key={q.id}
                          size="sm"
                          className={`${
                            isCurrent ? 'btn-warning' :
                            isAnswered ? 'btn-success' :
                            'btn-outline-main'
                          }`}
                          style={{ width: '36px', height: '36px', padding: '0', fontSize: '12px' }}
                          onClick={() => {
                            setCurrentSection('reading');
                            handleQuestionJump(index);
                          }}
                        >
                          {q.id}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Card.Body>

              <Card.Footer className="bg-neutral-50 border-top border-neutral-100 p-16">
                <div className="d-flex align-items-center gap-8 mb-8">
                  <div className="bg-success-600 rounded" style={{ width: '16px', height: '16px' }}></div>
                  <span className="text-neutral-700 text-12">Đã trả lời</span>
                </div>
                <div className="d-flex align-items-center gap-8 mb-8">
                  <div className="bg-main-600 rounded" style={{ width: '16px', height: '16px' }}></div>
                  <span className="text-neutral-700 text-12">Câu hiện tại</span>
                </div>
                <div className="d-flex align-items-center gap-8">
                  <div className="bg-white border border-neutral-300 rounded" style={{ width: '16px', height: '16px' }}></div>
                  <span className="text-neutral-700 text-12">Chưa trả lời</span>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Submit Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-question-circle text-warning-600 me-2"></i>
            Xác nhận nộp bài
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-16">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Bạn đã trả lời <strong>{getAnsweredCount()}/{getAllQuestions().length}</strong> câu hỏi.
          </Alert>
          <p className="text-neutral-700 mb-0">
            Bạn có chắc chắn muốn nộp bài không? Sau khi nộp bạn sẽ không thể chỉnh sửa câu trả lời.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowSubmitModal(false)}>
            Hủy
          </Button>
          <Button variant="success" onClick={confirmSubmit}>
            <i className="fas fa-check me-2"></i>
            Nộp bài
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Exit Modal */}
      <Modal show={showExitModal} onHide={() => setShowExitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle text-danger me-2"></i>
            Xác nhận thoát
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" className="mb-16">
            <i className="fas fa-exclamation-circle me-2"></i>
            Tiến trình làm bài của bạn sẽ <strong>KHÔNG được lưu</strong>!
          </Alert>
          <p className="text-neutral-700 mb-0">
            Bạn có chắc chắn muốn thoát không?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowExitModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmExit}>
            <i className="fas fa-sign-out-alt me-2"></i>
            Thoát
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ToeicTestTaking;
