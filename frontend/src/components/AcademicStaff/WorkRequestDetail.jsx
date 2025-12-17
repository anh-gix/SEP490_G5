import { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, Badge, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import academicWorkRequestService from '../../services/academicWorkRequestService';

const WorkRequestDetail = ({ requestId, onBack }) => {
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [completionNote, setCompletionNote] = useState('');

  useEffect(() => {
    fetchRequestDetail();
  }, [requestId]);

  const fetchRequestDetail = async () => {
    try {
      const response = await academicWorkRequestService.getRequestById(requestId);
      if (response.success) {
        setRequest(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProcessing = async () => {
    try {
      setProcessing(true);
      await academicWorkRequestService.startProcessing(requestId, user._id);
      toast.success('Đã bắt đầu xử lý!');
      fetchRequestDetail(); // Refresh
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadOutput = async () => {
    if (!uploadFile) {
      toast.warning('Vui lòng chọn file!');
      return;
    }
    try {
      setProcessing(true);
      await academicWorkRequestService.uploadOutputFile(requestId, user._id, uploadFile);
      toast.success('Upload thành công!');
      setUploadFile(null);
      fetchRequestDetail(); // Refresh
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    try {
      setProcessing(true);
      await academicWorkRequestService.completeRequest(requestId, user._id, completionNote);
      toast.success('Hoàn thành!');
      onBack();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setProcessing(false);
    }
  };

  const getRequestTypeName = (type) => {
    const names = {
      assign_students: 'Sắp xếp học viên',
      create_program: 'Tạo chương trình',
      edit_course: 'Chỉnh sửa khóa học',
      create_exam: 'Tạo đề thi'
    };
    return names[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xử lý',
      in_progress: 'Đang xử lý',
      completed: 'Hoàn thành',
      rejected: 'Từ chối',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status) => {
    const variants = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      rejected: 'danger',
      cancelled: 'secondary'
    };
    return variants[status] || 'secondary';
  };

  if (loading) {
    return (
      <Container fluid className="p-24">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-muted mt-2">Đang tải thông tin chi tiết...</p>
        </div>
      </Container>
    );
  }

  if (!request) {
    return (
      <Container fluid className="p-24">
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Không tìm thấy yêu cầu
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-24">
      {/* Header với nút quay lại */}
      <div className="mb-24">
        <div className="d-flex align-items-center gap-12 mb-16">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onBack}
            className="d-flex align-items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </Button>
        </div>
        <h4 className="text-neutral-900 fw-bold mb-8">
          Chi tiết công việc
        </h4>
      </div>

      {/* Card chứa thông tin đơn */}
      <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Body className="p-20">
          {/* Thông tin cơ bản */}
          <div className="mb-16">
            <Row className="mb-3">
              <Col md={4}>
                <strong className="text-neutral-700">Loại công việc:</strong>
              </Col>
              <Col md={8}>
                <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                  {getRequestTypeName(request.requestType)}
                </span>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <strong className="text-neutral-700">Trạng thái:</strong>
              </Col>
              <Col md={8}>
                <Badge bg={getStatusVariant(request.status)}>{getStatusLabel(request.status)}</Badge>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <strong className="text-neutral-700">Người gửi:</strong>
              </Col>
              <Col md={8}>
                <span className="text-neutral-900">{request.requestedBy?.username || 'N/A'}</span>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <strong className="text-neutral-700">Ngày gửi:</strong>
              </Col>
              <Col md={8}>
                <span className="text-neutral-900">{new Date(request.requestedAt).toLocaleString('vi-VN')}</span>
              </Col>
            </Row>
            {request.requestNote && (
              <Row className="mb-3">
                <Col md={4}>
                  <strong className="text-neutral-700">Ghi chú:</strong>
                </Col>
                <Col md={8}>
                  <span className="text-neutral-900">{request.requestNote}</span>
                </Col>
              </Row>
            )}
          </div>

          {/* File đầu vào */}
          {request.inputFile && (
            <div className="border-top pt-16 mb-16">
              <h6 className="text-neutral-900 fw-bold mb-12">File đầu vào</h6>
              <div className="border border-neutral-100 rounded-12 p-16 bg-white">
                <div className="d-flex align-items-center gap-12">
                  <i className="fas fa-file-excel text-success" style={{ fontSize: '24px' }}></i>
                  <div className="flex-grow-1">
                    <div className="text-neutral-900 fw-medium mb-2">
                      {request.inputFile.fileName}
                    </div>
                    <div className="text-neutral-600 text-13 mb-8">
                      Kích thước: {(request.inputFile.fileSize / 1024).toFixed(2)} KB
                    </div>
                    <Button 
                      variant="outline-primary"
                      size="sm"
                      onClick={() => academicWorkRequestService.downloadFile(request.inputFile.fileUrl)}
                      className="d-flex align-items-center gap-2"
                    >
                      <i className="fas fa-download"></i>
                      Tải xuống
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Các hành động dựa trên trạng thái */}
          {request.status === 'pending' && (
            <div className="border-top pt-16">
              <h6 className="text-neutral-900 fw-bold mb-12">Hành động</h6>
              <Alert variant="info" className="mb-12">
                <i className="fas fa-info-circle me-2"></i>
                Công việc chưa được bắt đầu. Nhấn nút bên dưới để bắt đầu xử lý.
              </Alert>
              <Button 
                variant="success" 
                onClick={handleStartProcessing}
                disabled={processing}
                className="d-flex align-items-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    Bắt đầu xử lý
                  </>
                )}
              </Button>
            </div>
          )}

          {request.status === 'in_progress' && (
            <div className="border-top pt-16">
              <h6 className="text-neutral-900 fw-bold mb-12">Upload kết quả</h6>
              {request.outputFile ? (
                <Alert variant="success" className="mb-12">
                  <i className="fas fa-check-circle me-2"></i>
                  Đã upload: <strong>{request.outputFile.fileName}</strong>
                </Alert>
              ) : (
                <div className="mb-16">
                  <Form.Group className="mb-12">
                    <Form.Label className="text-neutral-700">Chọn file kết quả (.xlsx, .xls, .csv):</Form.Label>
                    <Form.Control 
                      type="file" 
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                    />
                  </Form.Group>
                  <Button 
                    variant="primary" 
                    onClick={handleUploadOutput}
                    disabled={processing || !uploadFile}
                    className="d-flex align-items-center gap-2"
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload"></i>
                        Upload kết quả
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Hoàn thành */}
              {request.outputFile && (
                <div className="mt-16 pt-16 border-top">
                  <h6 className="text-neutral-900 fw-bold mb-12">Hoàn thành công việc</h6>
                  <Form.Group className="mb-12">
                    <Form.Label className="text-neutral-700">Ghi chú hoàn thành:</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3}
                      value={completionNote}
                      onChange={(e) => setCompletionNote(e.target.value)}
                      placeholder="Nhập ghi chú về kết quả (tùy chọn)..."
                    />
                  </Form.Group>
                  <Button 
                    variant="success" 
                    onClick={handleComplete}
                    disabled={processing}
                    className="d-flex align-items-center gap-2"
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Hoàn thành
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {request.status === 'completed' && (
            <div className="border-top pt-16">
              <Alert variant="success" className="mb-0">
                <div className="d-flex align-items-start gap-2">
                  <i className="fas fa-check-circle mt-1"></i>
                  <div className="flex-grow-1">
                    <strong>Yêu cầu đã hoàn thành</strong>
                    {request.responseNote && (
                      <p className="mb-0 mt-2 text-neutral-700">
                        <strong>Ghi chú:</strong> {request.responseNote}
                      </p>
                    )}
                    {request.outputFile && (
                      <div className="mt-12">
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => academicWorkRequestService.downloadFile(request.outputFile.fileUrl)}
                          className="d-flex align-items-center gap-2"
                        >
                          <i className="fas fa-download"></i>
                          Tải xuống file kết quả
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Footer với nút đóng */}
      <div className="d-flex justify-content-end">
        <Button 
          variant="secondary" 
          onClick={onBack}
        >
          Đóng
        </Button>
      </div>
    </Container>
  );
};

export default WorkRequestDetail;

