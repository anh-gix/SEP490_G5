import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  Alert,
  ListGroup
} from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';

const HomeworkDetail = () => {
  const { classId, homeworkId } = useParams();
  const [homework, setHomework] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);

  useEffect(() => {
    fetchHomeworkDetail();
  }, [classId, homeworkId]);

  const fetchHomeworkDetail = async () => {
    try {
      const mockHomework = [
        {
          id: 1,
          title: 'Unit 6 - Grammar Exercise',
          description: 'Complete exercises 1-10 on page 45',
          dueDate: '2025-11-05',
          status: 'pending',
          submittedDate: null,
          attachments: [],
          feedback: null,
          gradedFiles: []
        },
        {
          id: 2,
          title: 'Reading Comprehension Test',
          description: 'Read the passage and answer questions',
          dueDate: '2025-11-07',
          status: 'submitted',
          submittedDate: '2025-11-06',
          attachments: ['reading_answers.pdf'],
          feedback: null,
          gradedFiles: []
        },
        {
          id: 3,
          title: 'Unit 5 - Writing Assignment',
          description: 'Write a short paragraph about your daily routine',
          dueDate: '2025-10-30',
          status: 'graded',
          submittedDate: '2025-10-29',
          attachments: ['assignment_5.pdf'],
          feedback: 'Good work! Pay attention to verb tenses.',
          score: 9,
          gradedFiles: [
            {
              name: 'assignment_5_marked.pdf',
              url: '#'
            }
          ]
        }
      ];

      const detail = mockHomework.find(
        (item) => item.id === Number(homeworkId)
      );

      setHomework(detail || null);
    } catch (error) {
      console.error('Error fetching homework detail:', error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setUploadMessage(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setUploadMessage({
        type: 'danger',
        text: 'Vui lòng chọn tệp trước khi nộp.'
      });
      return;
    }

    setUploadMessage({
      type: 'success',
      text: `Đã tải lên "${selectedFile.name}".`
    });

    setSelectedFile(null);
    event.target.reset();
  };

  const renderStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-warning-600', text: 'Chưa nộp' },
      submitted: { bg: 'bg-info-500', text: 'Đã nộp' },
      graded: { bg: 'bg-success-600', text: 'Đã chấm' },
      late: { bg: 'bg-danger-600', text: 'Quá hạn' }
    }[status] || { bg: 'bg-neutral-500', text: 'Không rõ' };

    return (
      <Badge className={`${config.bg} text-white px-12 py-6`}>
        {config.text}
      </Badge>
    );
  };

  if (!homework) {
    return (
      <Container fluid className="py-24 px-24">
        <div className="text-center py-60">
          <div className="spinner-border text-main-600 mb-16" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-neutral-500">Đang tải chi tiết bài tập...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24">
        <nav className="mb-24">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link
                to="/student/courses"
                className="text-main-600 text-decoration-none"
              >
                Lớp học của tôi
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link
                to={`/student/class/${classId}`}
                className="text-main-600 text-decoration-none"
              >
                Chi tiết lớp
              </Link>
            </li>
            <li className="breadcrumb-item active text-neutral-700">
              {homework.title}
            </li>
          </ol>
        </nav>

        <Row className="g-3">
          <Col xs={12}>
            <Card className="bg-white border-0 rounded-12 mb-3">
              <Card.Header
                className="border-0 p-20 d-flex justify-content-between align-items-center"
                style={{
                  background:
                    'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)'
                }}
              >
                <div>
                  <Badge className="bg-main-50 text-main-600 px-12 py-6 text-13 fw-semibold mb-12">
                    Bài tập
                  </Badge>
                  <h4 className="text-neutral-900 fw-bold mb-0">
                    {homework.title}
                  </h4>
                </div>
                <Button
                  as={Link}
                  to={{
                    pathname: `/student/class/${classId}`,
                    hash: '#homework',
                    state: { openHomeworkTab: true }
                  }}
                  className="btn-outline-main text-13 fw-medium px-20 py-10 radius-8"
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Quay lại danh sách
                </Button>
              </Card.Header>
              <Card.Body className="p-24">
                <div className="d-flex flex-column flex-xl-row align-items-start gap-3 mb-20">
                  <div className="flex-grow-1">
                    <h6 className="text-neutral-900 fw-semibold mb-10">
                      Mô tả bài tập
                    </h6>
                    <p className="text-neutral-700 text-14 mb-0">
                      {homework.description}
                    </p>
                  </div>
                  <div
                    className="d-flex flex-wrap gap-12"
                    style={{ flex: '0 0 auto', minWidth: '240px' }}
                  >
                    {[
                      {
                        label: 'Hạn nộp',
                        content: new Date(homework.dueDate).toLocaleDateString(
                          'vi-VN'
                        )
                      },
                      {
                        label: 'Trạng thái',
                        content: renderStatusBadge(homework.status)
                      },
                      {
                        label: 'Ngày nộp',
                        content: homework.submittedDate
                          ? new Date(
                              homework.submittedDate
                            ).toLocaleDateString('vi-VN')
                          : 'Chưa nộp'
                      }
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-neutral-25 rounded-12 p-16"
                        style={{ flex: '1 1 160px', minWidth: '160px' }}
                      >
                        <div className="text-neutral-500 text-12 mb-8">
                          {item.label}
                        </div>
                        {typeof item.content === 'string' ? (
                          <div className="text-neutral-900 fw-semibold text-16">
                            {item.content}
                          </div>
                        ) : (
                          item.content
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {typeof homework.score === 'number' && (
                  <Card className="bg-success-25 border-0 rounded-12 mt-24">
                    <Card.Body className="p-20 d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-neutral-500 text-13 mb-4">
                          Điểm số
                        </div>
                        <div className="text-neutral-900 fw-semibold text-18">
                          {homework.score}/10
                        </div>
                      </div>
                      <Badge className="bg-success-600 text-white px-16 py-8 text-14">
                        Đã chấm
                      </Badge>
                    </Card.Body>
                  </Card>
                )}

                {homework.feedback && (
                  <Alert variant="info" className="mt-24">
                    <div className="fw-semibold mb-8">
                      <i className="fas fa-comments me-2"></i>
                      Nhận xét từ giảng viên
                    </div>
                    <p className="mb-0 text-neutral-700">{homework.feedback}</p>
                  </Alert>
                )}

                {homework.attachments?.length > 0 && (
                  <div className="mt-24">
                    <h6 className="text-neutral-900 fw-semibold mb-12">
                      Tệp đã nộp
                    </h6>
                    <ListGroup>
                      {homework.attachments.map((file, index) => (
                        <ListGroup.Item key={index}>
                          <i className="fas fa-file me-2 text-main-600"></i>
                          {file}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}

                <div className="mt-32 pt-24" style={{ borderTop: '1px solid #eef2f6' }}>
                  <Row className="g-3">
                    <Col xl={6}>
                      <h5 className="text-neutral-900 fw-semibold mb-16">
                        Nộp bài
                      </h5>
                      {uploadMessage && (
                        <Alert
                          variant={uploadMessage.type}
                          onClose={() => setUploadMessage(null)}
                          dismissible
                        >
                          {uploadMessage.text}
                        </Alert>
                      )}
                      <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="homeworkFile" className="mb-20">
                          <Form.Label className="text-neutral-700 text-14 fw-medium">
                            Chọn tệp bài làm (PDF, DOC, ZIP...)
                          </Form.Label>
                          <Form.Control
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.zip,.rar,.ppt,.pptx"
                          />
                          <Form.Text className="text-neutral-500 text-12">
                            Dung lượng tối đa 25MB.
                          </Form.Text>
                        </Form.Group>
                        <Button
                          type="submit"
                          className="btn-main text-13 fw-medium px-20 py-10 radius-8 w-100"
                        >
                          <i className="fas fa-upload me-2"></i>
                          Nộp bài
                        </Button>
                      </Form>
                    </Col>
                    <Col xl={6}>
                      <h5 className="text-neutral-900 fw-semibold mb-16">
                        Kết quả
                      </h5>
                      {homework.gradedFiles?.length > 0 ? (
                        <ListGroup className="mb-0">
                          {homework.gradedFiles.map((file, index) => (
                            <ListGroup.Item
                              key={index}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <i className="fas fa-file text-success-600 me-2"></i>
                                {file.name}
                              </div>
                              <Button
                                as="a"
                                className="btn-outline-main text-13 fw-medium px-16 py-6 radius-8"
                                href={file.url}
                                download
                              >
                                <i className="fas fa-download me-2"></i>
                                Tải về
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      ) : (
                        <div className="bg-neutral-25 border border-neutral-100 rounded-12 p-24 text-center">
                          <i className="fas fa-box-open text-neutral-400 fa-lg mb-12"></i>
                          <p className="text-neutral-600 text-13 mb-0">
                            Chưa có bài chấm từ giảng viên.
                          </p>
                        </div>
                      )}
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
    </Container>
  );
};

export default HomeworkDetail;
