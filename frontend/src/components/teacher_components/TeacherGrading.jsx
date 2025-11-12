import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, Tabs, Tab } from 'react-bootstrap';

/**
 * Teacher Grading Component
 * Chấm điểm bài tập học viên
 */
const TeacherGrading = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [filterClass, setFilterClass] = useState('all');
  const [scores, setScores] = useState({
    reading: '',
    listening: '',
    writing: '',
    speaking: ''
  });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchPendingAssignments();
  }, []);

  const fetchPendingAssignments = async () => {
    // Mock data
    const mockData = [
      {
        id: 1,
        title: 'Unit 5 - Grammar Exercise',
        className: 'A2-Evening-01',
        classId: 1,
        dueDate: '2025-11-20',
        totalSubmitted: 18,
        graded: 10,
        pending: 8,
        type: 'homework'
      },
      {
        id: 2,
        title: 'Listening Practice - Part 1',
        className: 'A2-Evening-01',
        classId: 1,
        dueDate: '2025-11-15',
        totalSubmitted: 25,
        graded: 20,
        pending: 5,
        type: 'practice'
      },
      {
        id: 3,
        title: 'Midterm Test',
        className: 'B1-Afternoon-02',
        classId: 2,
        dueDate: '2025-11-18',
        totalSubmitted: 15,
        graded: 5,
        pending: 10,
        type: 'test'
      }
    ];
    setAssignments(mockData);
  };

  const fetchSubmissions = async (assignmentId) => {
    // Mock submissions data
    // TODO: Use assignmentId to fetch from API
    console.log('Fetching submissions for assignment:', assignmentId);
    const mockSubmissions = [
      {
        id: 1,
        studentName: 'Nguyễn Văn A',
        studentCode: 'SV001',
        studentEmail: 'nguyenvana@example.com',
        submittedAt: '2025-11-19T10:30:00',
        status: 'pending', // pending, graded
        files: [
          { name: 'Unit5_Exercise.pdf', size: '2.5 MB', url: '#' }
        ],
        scores: null,
        feedback: null
      },
      {
        id: 2,
        studentName: 'Trần Thị B',
        studentCode: 'SV002',
        studentEmail: 'tranthib@example.com',
        submittedAt: '2025-11-18T15:20:00',
        status: 'graded',
        files: [
          { name: 'Unit5_Homework.docx', size: '1.8 MB', url: '#' }
        ],
        scores: {
          reading: 8.5,
          listening: 7.0,
          writing: 8.0,
          speaking: 7.5,
          total: 7.75
        },
        feedback: 'Bài làm tốt, cần cải thiện phần listening.'
      },
      {
        id: 3,
        studentName: 'Lê Văn C',
        studentCode: 'SV003',
        studentEmail: 'levanc@example.com',
        submittedAt: '2025-11-19T14:45:00',
        status: 'pending',
        files: [
          { name: 'Grammar_Exercise.pdf', size: '3.2 MB', url: '#' }
        ],
        scores: null,
        feedback: null
      }
    ];
    setSubmissions(mockSubmissions);
  };

  const openGradingModal = (submission) => {
    setSelectedSubmission(submission);
    if (submission.scores) {
      setScores({
        reading: submission.scores.reading,
        listening: submission.scores.listening,
        writing: submission.scores.writing,
        speaking: submission.scores.speaking
      });
      setFeedback(submission.feedback || '');
    } else {
      setScores({ reading: '', listening: '', writing: '', speaking: '' });
      setFeedback('');
    }
    setShowGradingModal(true);
  };

  const calculateTotal = () => {
    const values = Object.values(scores).filter(v => v !== '').map(Number);
    if (values.length === 0) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  };

  const submitGrade = async () => {
    // TODO: API call to save grade
    const gradeData = {
      submissionId: selectedSubmission.id,
      scores: {
        ...scores,
        total: calculateTotal()
      },
      feedback
    };
    console.log('Submitting grade:', gradeData);
    
    // Update local state
    setSubmissions(submissions.map(s => 
      s.id === selectedSubmission.id 
        ? { ...s, status: 'graded', scores: gradeData.scores, feedback }
        : s
    ));
    
    setShowGradingModal(false);
    alert('Đã lưu điểm thành công!');
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      homework: { bg: 'bg-info-100', text: 'text-info-600', label: 'Bài tập' },
      practice: { bg: 'bg-warning-100', text: 'text-warning-600', label: 'Luyện tập' },
      test: { bg: 'bg-danger-100', text: 'text-danger-600', label: 'Kiểm tra' }
    };
    const config = typeConfig[type] || typeConfig.homework;
    return <Badge className={`${config.bg} ${config.text} px-12 py-6`}>{config.label}</Badge>;
  };

  const getStatusBadge = (status) => {
    return status === 'graded' 
      ? <Badge className="bg-success-600 text-white px-12 py-6">Đã chấm</Badge>
      : <Badge className="bg-warning-600 text-white px-12 py-6">Chờ chấm</Badge>;
  };

  const filteredAssignments = assignments.filter(a => 
    filterClass === 'all' || a.classId === parseInt(filterClass)
  );

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="mb-24">
        <h4 className="text-neutral-900 fw-bold mb-8">Chấm điểm bài tập</h4>
        <p className="text-neutral-600 mb-0">Xem và chấm điểm bài nộp của học viên</p>
      </div>

      {!selectedAssignment ? (
        <>
          {/* Summary Stats */}
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
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                      }}
                    >
                      <i className="fas fa-tasks text-white" style={{ fontSize: '24px' }}></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-13 mb-4">Tổng bài tập</div>
                      <div className="text-neutral-900 fw-bold text-32">{assignments.length}</div>
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
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                      }}
                    >
                      <i className="fas fa-clock text-white" style={{ fontSize: '24px' }}></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-13 mb-4">Chờ chấm</div>
                      <div className="text-neutral-900 fw-bold text-32">
                        {assignments.reduce((sum, a) => sum + a.pending, 0)}
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
                      <i className="fas fa-check-circle text-white" style={{ fontSize: '24px' }}></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-13 mb-4">Đã chấm</div>
                      <div className="text-neutral-900 fw-bold text-32">
                        {assignments.reduce((sum, a) => sum + a.graded, 0)}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filter */}
          <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
            <Card.Body className="p-20">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="radius-8">
                    <option value="all">Tất cả lớp học</option>
                    <option value="1">A2-Evening-01</option>
                    <option value="2">B1-Afternoon-02</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Assignments List */}
          <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
            <Card.Body className="p-0">
              <Table hover className="mb-0">
                <thead>
                  <tr className="bg-neutral-25">
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Bài tập</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Lớp học</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Loại</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Hạn nộp</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Chờ chấm</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Đã chấm</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map(assignment => (
                    <tr key={assignment.id}>
                      <td className="px-20 py-16">
                        <div className="text-neutral-900 fw-semibold text-14">{assignment.title}</div>
                        <div className="text-neutral-500 text-12">{assignment.totalSubmitted} bài nộp</div>
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">{assignment.className}</td>
                      <td className="px-20 py-16">{getTypeBadge(assignment.type)}</td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-20 py-16 text-center">
                        <Badge className="bg-warning-100 text-warning-600 px-12 py-6 text-14 fw-bold">
                          {assignment.pending}
                        </Badge>
                      </td>
                      <td className="px-20 py-16 text-center">
                        <Badge className="bg-success-100 text-success-600 px-12 py-6 text-14 fw-bold">
                          {assignment.graded}
                        </Badge>
                      </td>
                      <td className="px-20 py-16 text-center">
                        <Button 
                          className="btn-main text-13 px-16 py-8 radius-6"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            fetchSubmissions(assignment.id);
                          }}
                        >
                          <i className="fas fa-pen me-2"></i>
                          Chấm điểm
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      ) : (
        <>
          {/* Assignment Header */}
          <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
            <Card.Body className="p-24">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <Button 
                    className="btn-outline-neutral text-13 px-12 py-6 radius-6 mb-16"
                    onClick={() => setSelectedAssignment(null)}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Quay lại
                  </Button>
                  <h5 className="text-neutral-900 fw-bold mb-8">{selectedAssignment.title}</h5>
                  <div className="d-flex gap-16 align-items-center">
                    <span className="text-neutral-600 text-13">
                      <i className="fas fa-chalkboard me-2"></i>
                      {selectedAssignment.className}
                    </span>
                    {getTypeBadge(selectedAssignment.type)}
                    <span className="text-neutral-600 text-13">
                      <i className="fas fa-calendar me-2"></i>
                      Hạn: {new Date(selectedAssignment.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-neutral-500 text-12 mb-4">Tiến độ chấm điểm</div>
                  <div className="text-neutral-900 fw-bold text-24">
                    {selectedAssignment.graded}/{selectedAssignment.totalSubmitted}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Submissions Table */}
          <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
            <Card.Body className="p-0">
              <Table hover className="mb-0">
                <thead>
                  <tr className="bg-neutral-25">
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">STT</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Học viên</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Mã SV</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Thời gian nộp</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Files</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Điểm</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                    <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, index) => (
                    <tr key={submission.id}>
                      <td className="px-20 py-16 text-neutral-700 text-13">{index + 1}</td>
                      <td className="px-20 py-16">
                        <div className="text-neutral-900 fw-medium text-14">{submission.studentName}</div>
                        <div className="text-neutral-500 text-11">{submission.studentEmail}</div>
                      </td>
                      <td className="px-20 py-16 text-neutral-900 fw-medium text-13">{submission.studentCode}</td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-20 py-16">
                        {submission.files.map((file, idx) => (
                          <div key={idx} className="text-13">
                            <i className="fas fa-file me-1 text-main-600"></i>
                            <a href={file.url} className="text-main-600 text-decoration-none">
                              {file.name}
                            </a>
                            <span className="text-neutral-400 ms-2">({file.size})</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-20 py-16">
                        {submission.scores ? (
                          <div className="text-neutral-900 fw-bold text-16">
                            {submission.scores.total}
                          </div>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="px-20 py-16">{getStatusBadge(submission.status)}</td>
                      <td className="px-20 py-16 text-center">
                        <Button 
                          className={submission.status === 'graded' ? 'btn-outline-main' : 'btn-warning'}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => openGradingModal(submission)}
                        >
                          <i className={`fas ${submission.status === 'graded' ? 'fa-eye' : 'fa-pen'} me-1`}></i>
                          {submission.status === 'graded' ? 'Xem điểm' : 'Chấm điểm'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Grading Modal */}
      <Modal show={showGradingModal} onHide={() => setShowGradingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chấm điểm bài tập</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <>
              {/* Student Info */}
              <Card className="bg-neutral-25 border-0 mb-20">
                <Card.Body className="p-16">
                  <Row>
                    <Col md={6}>
                      <div className="text-neutral-600 text-12 mb-4">Học viên</div>
                      <div className="text-neutral-900 fw-bold text-16">{selectedSubmission.studentName}</div>
                      <div className="text-neutral-500 text-13">{selectedSubmission.studentCode}</div>
                    </Col>
                    <Col md={6}>
                      <div className="text-neutral-600 text-12 mb-4">Thời gian nộp</div>
                      <div className="text-neutral-900 text-14">
                        {new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN')}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Files */}
              <div className="mb-20">
                <h6 className="text-neutral-900 fw-semibold mb-12">Files đã nộp</h6>
                {selectedSubmission.files.map((file, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-12 bg-neutral-50 rounded-8 p-12 mb-8">
                    <i className="fas fa-file-pdf text-danger-600" style={{ fontSize: '24px' }}></i>
                    <div className="flex-grow-1">
                      <div className="text-neutral-900 fw-medium text-14">{file.name}</div>
                      <div className="text-neutral-500 text-12">{file.size}</div>
                    </div>
                    <Button className="btn-outline-main text-12 px-12 py-6 radius-6">
                      <i className="fas fa-download me-2"></i>
                      Tải xuống
                    </Button>
                  </div>
                ))}
              </div>

              {/* Scores */}
              <div className="mb-20">
                <h6 className="text-neutral-900 fw-semibold mb-12">Điểm số</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-13">Reading</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={scores.reading}
                        onChange={(e) => setScores({ ...scores, reading: e.target.value })}
                        placeholder="0.0 - 10.0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-13">Listening</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={scores.listening}
                        onChange={(e) => setScores({ ...scores, listening: e.target.value })}
                        placeholder="0.0 - 10.0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-13">Writing</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={scores.writing}
                        onChange={(e) => setScores({ ...scores, writing: e.target.value })}
                        placeholder="0.0 - 10.0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-13">Speaking</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={scores.speaking}
                        onChange={(e) => setScores({ ...scores, speaking: e.target.value })}
                        placeholder="0.0 - 10.0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Total Score */}
                <div className="bg-main-25 rounded-8 p-16 mt-16">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-neutral-900 fw-semibold text-14">Điểm trung bình</span>
                    <span className="text-main-600 fw-bold text-24">{calculateTotal()}</span>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <Form.Group>
                  <Form.Label className="text-neutral-900 fw-semibold">Nhận xét</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Nhập nhận xét cho học viên..."
                  />
                </Form.Group>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-outline-neutral" onClick={() => setShowGradingModal(false)}>
            Hủy
          </Button>
          <Button className="btn-main" onClick={submitGrade}>
            <i className="fas fa-save me-2"></i>
            Lưu điểm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherGrading;
