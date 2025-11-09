import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import bulkUserService from '../services/bulkUserService';
import axios from 'axios';

const BulkUserUploadPage = () => {
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const [saveResults, setSaveResults] = useState(null);
  const fileInputRef = useRef(null);

  // Lấy danh sách roles khi component mount
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:9999/api/roles', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setUsers([]);
        setErrors([]);
        setDuplicates([]);
        setSaveResults(null);
      } else {
        alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        e.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Vui lòng chọn file Excel');
      return;
    }

    setLoading(true);
    setUsers([]);
    setErrors([]);
    setDuplicates([]);
    setSaveResults(null);
    
    try {
      const response = await bulkUserService.uploadExcel(file);
      setUsers(response.users || []);
      setErrors(response.errors || []);
      setDuplicates(response.duplicates || []);
      
      if (response.hasErrors) {
        alert('File có một số lỗi. Vui lòng kiểm tra phần thông báo lỗi bên dưới.');
      } else if (response.users && response.users.length > 0) {
        alert(`Đã đọc thành công ${response.users.length} tài khoản từ file Excel!`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể đọc file Excel';
      const errorDetails = error.response?.data?.error || error.response?.data?.details;
      
      let fullErrorMessage = errorMessage;
      if (errorDetails) {
        fullErrorMessage += `\n\nChi tiết: ${errorDetails}`;
      }
      
      alert(fullErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      alert('Vui lòng chọn role cho các tài khoản');
      return;
    }

    if (users.length === 0) {
      alert('Không có dữ liệu để lưu');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn tạo ${users.length} tài khoản với role đã chọn?`)) {
      return;
    }

    setSaving(true);
    try {
      const response = await bulkUserService.saveBulkUsers(users, selectedRoleId);
      setSaveResults(response);
      alert(`Đã tạo ${response.success} tài khoản thành công, ${response.failed} tài khoản thất bại`);
    } catch (error) {
      console.error('Error saving users:', error);
      alert(error.message || 'Không thể lưu tài khoản');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUsers([]);
    setErrors([]);
    setDuplicates([]);
    setSaveResults(null);
    setSelectedRoleId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container fluid className="py-24 px-24">
      {/* Header */}
      <div className="mb-24">
        <h3 className="text-neutral-900 fw-bold mb-8">Tạo tài khoản hàng loạt</h3>
        <p className="text-neutral-500 mb-0">Upload file Excel để tạo nhiều tài khoản cùng lúc</p>
      </div>

      {/* Upload Section */}
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-20">
          <Row>
            <Col md={8}>
              <Form.Group className="mb-16">
                <Form.Label className="fw-semibold mb-8">Chọn file Excel</Form.Label>
                <Form.Control
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <Form.Text className="text-muted">
                  File Excel phải có các cột: email, username, phone, address
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-100"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload me-2"></i>
                    Generate
                  </>
                )}
              </Button>
            </Col>
          </Row>

          {file && (
            <div className="mt-16">
              <Badge bg="info" className="me-2">
                <i className="fas fa-file-excel me-1"></i>
                {file.name}
              </Badge>
              <Button variant="link" size="sm" onClick={handleReset} className="text-danger">
                <i className="fas fa-times me-1"></i>
                Xóa file
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Errors and Duplicates */}
      {(errors.length > 0 || duplicates.length > 0) && (
        <Card className="bg-white border border-warning rounded-12 box-shadow-sm mb-24">
          <Card.Body className="p-20">
            <h5 className="text-warning mb-16">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Cảnh báo
            </h5>
            
            {errors.length > 0 && (
              <div className="mb-16">
                <h6 className="text-danger mb-8">Lỗi trong file ({errors.length} dòng):</h6>
                <ul className="list-unstyled">
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index} className="text-danger mb-4">
                      Dòng {error.row}: {error.errors.join(', ')}
                    </li>
                  ))}
                  {errors.length > 10 && (
                    <li className="text-muted">... và {errors.length - 10} lỗi khác</li>
                  )}
                </ul>
              </div>
            )}

            {duplicates.length > 0 && (
              <div>
                <h6 className="text-warning mb-8">Trùng lặp trong file ({duplicates.length}):</h6>
                <ul className="list-unstyled">
                  {duplicates.slice(0, 10).map((dup, index) => (
                    <li key={index} className="text-warning mb-4">{dup}</li>
                  ))}
                  {duplicates.length > 10 && (
                    <li className="text-muted">... và {duplicates.length - 10} trùng lặp khác</li>
                  )}
                </ul>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Preview Users */}
      {users.length > 0 && (
        <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
          <Card.Body className="p-20">
            <div className="d-flex justify-content-between align-items-center mb-16">
              <h5 className="mb-0">
                Danh sách tài khoản ({users.length} tài khoản)
              </h5>
              <Form.Group className="mb-0" style={{ minWidth: '200px' }}>
                <Form.Select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                >
                  <option value="">-- Chọn Role --</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name || role.roleName || role._id}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Phone</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{user.email}</td>
                      <td>{user.username}</td>
                      <td>{user.phone}</td>
                      <td>{user.address}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="d-flex justify-content-end gap-12 mt-16">
              <Button variant="outline-secondary" onClick={handleReset}>
                <i className="fas fa-redo me-2"></i>
                Reset
              </Button>
              <Button
                variant="success"
                onClick={handleSave}
                disabled={!selectedRoleId || saving}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Save
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Save Results */}
      {saveResults && (
        <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
          <Card.Body className="p-20">
            <h5 className="mb-16">Kết quả lưu tài khoản</h5>
            
            <Alert variant="success" className="mb-16">
              <strong>Thành công:</strong> {saveResults.success} tài khoản
            </Alert>

            {saveResults.failed > 0 && (
              <Alert variant="danger" className="mb-16">
                <strong>Thất bại:</strong> {saveResults.failed} tài khoản
              </Alert>
            )}

            {saveResults.results?.success && saveResults.results.success.length > 0 && (
              <div className="mb-16">
                <h6 className="mb-8">Tài khoản đã tạo thành công:</h6>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saveResults.results.success.map((user, index) => (
                        <tr key={index}>
                          <td>{user.email}</td>
                          <td>{user.username}</td>
                          <td className="fw-bold text-success">{user.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}

            {saveResults.results?.failed && saveResults.results.failed.length > 0 && (
              <div>
                <h6 className="mb-8 text-danger">Tài khoản thất bại:</h6>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Lý do</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saveResults.results.failed.map((user, index) => (
                        <tr key={index}>
                          <td>{user.email}</td>
                          <td>{user.username}</td>
                          <td className="text-danger">{user.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default BulkUserUploadPage;

