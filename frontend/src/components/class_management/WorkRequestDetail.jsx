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
  const [uploadFiles, setUploadFiles] = useState([]);

  // Remove file from selection
  const removeFile = (fileIndex) => {
    const updatedFiles = uploadFiles.filter((_, index) => index !== fileIndex);
    setUploadFiles(updatedFiles);
  };

  // Add more files to existing selection
  const addMoreFiles = (newFiles) => {
    const newFileArray = Array.from(newFiles);
    const currentFileNames = uploadFiles.map(file => file.name);

    // Filter out duplicate files
    const uniqueNewFiles = newFileArray.filter(newFile => {
      if (currentFileNames.includes(newFile.name)) {
        toast.warning(`File "${newFile.name}" đã tồn tại trong danh sách!`);
        return false;
      }
      return true;
    });

    if (uniqueNewFiles.length > 0) {
      setUploadFiles([...uploadFiles, ...uniqueNewFiles]);
      if (uniqueNewFiles.length < newFileArray.length) {
        toast.info(`Đã thêm ${uniqueNewFiles.length} file mới, ${newFileArray.length - uniqueNewFiles.length} file bị trùng đã bỏ qua.`);
      }
    }
  };

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
    if (!uploadFiles || uploadFiles.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một file!');
      return;
    }
    try {
      setProcessing(true);

      if (request.status === 'need_revision') {
        // For need_revision: Resubmit with new files (clears old files)
        await academicWorkRequestService.resubmitAssignStudentsRequest(
          requestId,
          user._id,
          uploadFiles,
          'Đã chỉnh sửa và gửi lại báo cáo'
        );
        toast.success(`Gửi lại ${uploadFiles.length} file báo cáo mới thành công!`);
      } else {
        // For in_progress: Upload files and complete
        // Step 1: Upload files
        await academicWorkRequestService.uploadOutputFile(requestId, user._id, uploadFiles);

        // Step 2: Complete the request (submit for approval)
        await academicWorkRequestService.completeRequest(requestId, user._id, 'Đã hoàn thành và gửi báo cáo');

        toast.success(`Upload ${uploadFiles.length} file và gửi báo cáo thành công!`);
      }

      setUploadFiles([]);
      fetchRequestDetail(); // Refresh
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
      need_revision: 'Yêu cầu chỉnh sửa',
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
      need_revision: 'secondary',
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
              <h6 className="text-neutral-900 fw-bold mb-12">Gửi báo cáo hoàn thành</h6>
              {request.outputFiles && request.outputFiles.length > 0 ? (
                <Alert variant="success" className="mb-12">
                  <i className="fas fa-check-circle me-2"></i>
                  Đã gửi báo cáo với <strong>{request.outputFiles.length} file</strong>
                  {request.outputFiles.map((file, index) => (
                    <div key={index} className="mt-2">
                      • {file.fileName}
                    </div>
                  ))}
                </Alert>
              ) : (
                <div className="mb-16">
                  <Alert variant="info" className="mb-12">
                    <i className="fas fa-info-circle me-2"></i>
                    Upload file và gửi báo cáo hoàn thành cùng lúc. Sau khi gửi, trạng thái sẽ chuyển sang "Chờ duyệt".
                  </Alert>
                  <Form.Group className="mb-12">
                    <Form.Label className="text-neutral-700">Chọn file kết quả (.xlsx, .xls, .csv, .pdf, .doc, .docx, .zip, .rar):</Form.Label>
                    {/* File Input */}
                    <div className="d-flex gap-2 align-items-end">
                      <div className="flex-grow-1">
                        <Form.Control
                          type="file"
                          accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.zip,.rar"
                          multiple
                          onChange={(e) => {
                            if (uploadFiles.length === 0) {
                              // First selection - replace all
                              setUploadFiles(Array.from(e.target.files));
                            } else {
                              // Add more files to existing selection
                              addMoreFiles(e.target.files);
                            }
                          }}
                        />
                      </div>
                      {uploadFiles.length > 0 && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => document.querySelector('input[type="file"]').click()}
                          title="Thêm file"
                        >
                          <i className="fas fa-plus"></i>
                        </Button>
                      )}
                    </div>
                    <Form.Text className="text-muted">
                      Chọn nhiều file cùng lúc hoặc nhấn "+" để thêm file
                    </Form.Text>

                    {/* File Preview Table */}
                    {uploadFiles.length > 0 && (
                      <div className="mt-16">
                        <h6 className="text-neutral-900 fw-bold mb-12">
                          File đã chọn ({uploadFiles.length})
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-2"
                            onClick={() => setUploadFiles([])}
                            title="Xóa tất cả"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </h6>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th className="text-center" style={{ width: '60px' }}>STT</th>
                                <th>Tên file</th>
                                <th className="text-center" style={{ width: '80px' }}>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {uploadFiles.map((file, index) => (
                                <tr key={index}>
                                  <td className="text-center fw-medium text-neutral-700">
                                    {index + 1}
                                  </td>
                                  <td className="text-neutral-900">
                                    {file.name}
                                  </td>
                                  <td className="text-center">
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => removeFile(index)}
                                      title="Xóa file này"
                                    >
                                      <i className="fas fa-trash-alt"></i>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleUploadOutput}
                    disabled={processing || !uploadFiles || uploadFiles.length === 0}
                    className="d-flex align-items-center gap-2"
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang gửi báo cáo...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload"></i>
                        {uploadFiles.length > 0
                          ? `Gửi ${uploadFiles.length} file báo cáo`
                          : 'Gửi báo cáo'
                        }
                      </>
                    )}
                  </Button>
                </div>
              )}

            </div>
          )}

          {request.status === 'need_revision' && (
            <div className="border-top pt-16">
              <h6 className="text-neutral-900 fw-bold mb-12">Gửi lại báo cáo sau chỉnh sửa</h6>
              <Alert variant="warning" className="mb-12">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Yêu cầu chỉnh sửa:</strong> {request.rejectionReason || 'Vui lòng chỉnh sửa và gửi lại báo cáo.'}
              </Alert>

              {/* File Preview Table */}
              <div className="mb-16">
                <Form.Group className="mb-12">
                  <Form.Label className="text-neutral-700">Chọn file báo cáo mới (.xlsx, .xls, .csv, .pdf, .doc, .docx, .zip, .rar):</Form.Label>
                  {/* File Input */}
                  <div className="d-flex gap-2 align-items-end">
                    <div className="flex-grow-1">
                      <Form.Control
                        type="file"
                        accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.zip,.rar"
                        multiple
                        onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                      />
                    </div>
                    {uploadFiles.length > 0 && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => document.querySelectorAll('input[type="file"]')[1].click()}
                        title="Thêm file"
                      >
                        <i className="fas fa-plus"></i>
                      </Button>
                    )}
                  </div>
                  <Form.Text className="text-muted">
                    Chọn nhiều file cùng lúc hoặc nhấn "+" để thêm file
                  </Form.Text>
                </Form.Group>

                {/* File Preview Table */}
                {uploadFiles.length > 0 && (
                  <div className="mt-16">
                    <h6 className="text-neutral-900 fw-bold mb-12">
                      File đã chọn ({uploadFiles.length})
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => setUploadFiles([])}
                        title="Xóa tất cả"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th className="text-center" style={{ width: '60px' }}>STT</th>
                            <th>Tên file</th>
                            <th className="text-center" style={{ width: '80px' }}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadFiles.map((file, index) => (
                            <tr key={index}>
                              <td className="text-center fw-medium text-neutral-700">
                                {index + 1}
                              </td>
                              <td className="text-neutral-900">
                                {file.name}
                              </td>
                              <td className="text-center">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    const updatedFiles = uploadFiles.filter((_, i) => i !== index);
                                    setUploadFiles(updatedFiles);
                                  }}
                                  title="Xóa file này"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={handleUploadOutput}
                  disabled={processing || !uploadFiles || uploadFiles.length === 0}
                  className="d-flex align-items-center gap-2"
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang gửi báo cáo...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload"></i>
                      {uploadFiles.length > 0
                        ? `Gửi ${uploadFiles.length} file báo cáo mới`
                        : 'Gửi báo cáo mới'
                      }
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Hiển thị files đã gửi nếu có (chỉ ở trạng thái chưa hoàn thành) */}
          {request.outputFiles && request.outputFiles.length > 0 && request.status !== 'completed' && (
            <div className="border-top pt-16">
              <h6 className="text-neutral-900 fw-bold mb-12">
                <i className="fas fa-file-alt me-2"></i>
                File báo cáo đã gửi ({request.outputFiles.length})
              </h6>
              <div className="row g-2">
                {request.outputFiles.map((file, index) => (
                  <div key={index} className="col-md-6">
                    <div className="border border-neutral-200 rounded-8 p-12 bg-light">
                      <div className="d-flex align-items-center gap-8">
                        <i className="fas fa-file text-primary" style={{ fontSize: '20px' }}></i>
                        <div className="flex-grow-1">
                          <div className="text-neutral-900 fw-medium text-truncate" title={file.fileName}>
                            {file.fileName}
                          </div>
                          <small className="text-muted">
                            {(file.fileSize / 1024).toFixed(2)} KB
                          </small>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => academicWorkRequestService.downloadFile(file.fileUrl)}
                          title="Tải xuống"
                        >
                          <i className="fas fa-download"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    {request.outputFiles && request.outputFiles.length > 0 && (
                      <div className="mt-12">
                        <div className="mb-8 text-neutral-700 fw-medium">File kết quả:</div>
                        {request.outputFiles.map((file, index) => (
                          <Button
                            key={index}
                            variant="outline-success"
                            size="sm"
                            onClick={() => academicWorkRequestService.downloadFile(file.fileUrl)}
                            className="d-flex align-items-center gap-2 me-2 mb-2"
                          >
                            <i className="fas fa-download"></i>
                            {file.fileName}
                          </Button>
                        ))}
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

