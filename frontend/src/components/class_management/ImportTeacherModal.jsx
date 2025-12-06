import React, { useRef, useEffect } from 'react';
import { Modal, Card, Button, Table, Badge } from 'react-bootstrap';

/**
 * ImportTeacherModal Component
 * Modal import giảng viên từ Excel
 */
const ImportTeacherModal = ({
  show,
  onHide,
  importFile,
  previewTeachers,
  importing,
  loading,
  onFileSelect,
  onPreviewExcel,
  onConfirmImport,
  onDownloadTemplate
}) => {
  const fileInputRef = useRef(null);

  // Reset file input when modal closes
  useEffect(() => {
    if (!show && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Import Giảng viên từ Excel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Phần 1: Hướng dẫn Format Excel */}
        <Card className="mb-3 border-info">
          <Card.Body className="bg-info bg-opacity-10">
            <h6 className="mb-3">
              <i className="fas fa-info-circle me-2"></i>
              Hướng dẫn Format Excel
            </h6>
            <p className="mb-2">Vui lòng đảm bảo file Excel của bạn có đúng format như bảng trên</p>
            <p className="mb-3 text-muted">
              <i className="fas fa-key me-1"></i>
              Lưu ý: Password sẽ tự động được tạo cho mỗi giảng viên (mặc định: 123456)
            </p>
            
            <div className="mb-3">
              <Button
                variant="outline-success"
                size="sm"
                onClick={onDownloadTemplate}
              >
                <i className="fas fa-download me-2"></i>
                Tải file mẫu
              </Button>
            </div>
            
            <Table striped bordered size="sm" className="mb-0">
              <thead className="table-info">
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>teacher1</td>
                  <td>teacher1@email.com</td>
                  <td>0123456789</td>
                  <td>123 Đường ABC</td>
                </tr>
                <tr>
                  <td>teacher2</td>
                  <td>teacher2@email.com</td>
                  <td>0987654321</td>
                  <td>456 Đường XYZ</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Phần 2: Upload File */}
        <Card className="mb-3">
          <Card.Body>
            <h6 className="mb-3">Upload File Excel</h6>
            <div className="d-flex align-items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={onFileSelect}
                style={{ display: 'none' }}
              />
              <Button
                variant="outline-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                <i className="fas fa-folder-open me-2"></i>
                Chọn file Excel
              </Button>
              {importFile && (
                <span className="text-muted">
                  <i className="fas fa-file-excel me-2 text-success"></i>
                  {importFile.name}
                </span>
              )}
              <Button
                variant="primary"
                onClick={onPreviewExcel}
                disabled={!importFile || importing}
              >
                {importing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload me-2"></i>
                    Tải lên và xem trước
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Phần 3: Bảng Preview */}
        {previewTeachers.length > 0 && (
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Preview dữ liệu</h6>
                <div>
                  <Badge bg="secondary" className="me-2">
                    Tổng số: {previewTeachers.length}
                  </Badge>
                  <Badge bg="success" className="me-2">
                    Hợp lệ: {previewTeachers.filter(t => !t.hasError).length}
                  </Badge>
                  <Badge bg="danger">
                    Lỗi: {previewTeachers.filter(t => t.hasError).length}
                  </Badge>
                </div>
              </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table striped bordered hover size="sm">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>STT</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Trạng thái</th>
                      <th>Lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewTeachers.map((teacher, index) => (
                      <tr 
                        key={index}
                        className={teacher.hasError ? 'table-danger' : 'table-success'}
                      >
                        <td>{teacher.rowNumber}</td>
                        <td>{teacher.username}</td>
                        <td>{teacher.email}</td>
                        <td>{teacher.phone}</td>
                        <td>{teacher.address}</td>
                        <td>
                          {teacher.hasError ? (
                            <Badge bg="danger">Lỗi</Badge>
                          ) : (
                            <Badge bg="success">Hợp lệ</Badge>
                          )}
                        </td>
                        <td>
                          {teacher.errors.length > 0 ? (
                            <ul className="mb-0" style={{ fontSize: '12px', paddingLeft: '20px' }}>
                              {teacher.errors.map((error, i) => (
                                <li key={i} className="text-danger">{error}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading || importing}>
          Hủy
        </Button>
        <Button
          variant="success"
          onClick={onConfirmImport}
          disabled={previewTeachers.filter(t => !t.hasError).length === 0 || loading || importing}
        >
          <i className="fas fa-check me-2"></i>
          Xác nhận và Import
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportTeacherModal;

