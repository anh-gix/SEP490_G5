import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import bulkUserService from '../services/bulkUserService';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewData, setPreviewData] = useState(null); // Lưu dữ liệu preview (chưa lưu DB)
  const fileInputRef = useRef(null);

  // Lấy danh sách roles khi component mount
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/roles', {
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

  // Hàm generate password ngẫu nhiên (giống backend)
  const generatePassword = () => {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(x => charset[x % charset.length])
      .join('');
  };

  // Generate preview (chưa lưu DB)
  const handleSave = () => {
    if (!selectedRoleId) {
      alert('Vui lòng chọn role cho các tài khoản');
      return;
    }

    if (users.length === 0) {
      alert('Không có dữ liệu để lưu');
      return;
    }

    // Generate password cho mỗi user và tạo preview data
    const previewUsers = users.map(user => ({
      ...user,
      password: generatePassword() // Generate password ở frontend
    }));

    // Tạo preview data (chưa lưu DB)
    const preview = {
      users: previewUsers,
      roleId: selectedRoleId,
      total: previewUsers.length,
      success: previewUsers.length,
      failed: 0
    };

    setPreviewData(preview);
    setSaveResults({
      success: previewUsers.length,
      failed: 0,
      total: previewUsers.length,
      roleId: selectedRoleId, // Lưu roleId để hiển thị
      results: {
        success: previewUsers,
        failed: []
      },
      isPreview: true // Đánh dấu đây là preview, chưa lưu DB
    });
  };

  // Xác nhận và lưu vào DB
  const handleConfirmSave = async () => {
    if (!previewData) {
      return;
    }

    setShowConfirmModal(false);
    setSaving(true);

    try {
      // Gọi API để lưu vào database (gửi kèm password đã generate ở preview)
      const response = await bulkUserService.saveBulkUsers(previewData.users, previewData.roleId);
      
      // Cập nhật kết quả (đã lưu DB)
      // Lưu lại password từ preview để hiển thị (vì đây là lần cuối có thể xem)
      const savedRoleId = previewData.roleId;
      setSaveResults({
        ...response,
        isPreview: false, // Đã lưu DB
        roleId: savedRoleId, // Lưu roleId để hiển thị
        // Giữ lại password từ preview cho lần hiển thị cuối cùng
        previewPasswords: previewData.users.reduce((acc, user) => {
          acc[user.email] = user.password;
          return acc;
        }, {})
      });
      
      // Reset preview data
      setPreviewData(null);
      
      alert(`Đã thêm ${response.success} tài khoản vào hệ thống thành công, ${response.failed} tài khoản thất bại`);
    } catch (error) {
      console.error('Error saving users:', error);
      alert(error.message || 'Không thể lưu tài khoản vào hệ thống');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Hàm reset toàn bộ state về trạng thái ban đầu khi người dùng muốn xóa file và bắt đầu lại
   * 
   * Chức năng:
   * 1. Xóa file đã chọn (setFile(null))
   * 2. Xóa danh sách users đã parse (setUsers([]))
   * 3. Xóa danh sách lỗi (setErrors([]))
   * 4. Xóa danh sách trùng lặp (setDuplicates([]))
   * 5. Xóa kết quả lưu/preview (setSaveResults(null))
   * 6. Xóa dữ liệu preview (setPreviewData(null))
   * 7. Reset role đã chọn (setSelectedRoleId(''))
   * 8. Đóng modal xác nhận nếu đang mở (setShowConfirmModal(false))
   * 9. Reset giá trị của input file về rỗng để có thể chọn lại file cùng tên
   * 
   * Lưu ý: Hàm này được gọi khi:
   * - Người dùng click icon X trong badge tên file (dòng 394)
   */
  const handleReset = () => {
    // 1. Xóa file đã chọn
    setFile(null);
    
    // 2. Xóa danh sách users đã parse từ file Excel
    setUsers([]);
    
    // 3. Xóa danh sách lỗi validation (nếu có)
    setErrors([]);
    
    // 4. Xóa danh sách email/username trùng lặp (nếu có)
    setDuplicates([]);
    
    // 5. Xóa kết quả preview hoặc kết quả sau khi lưu vào DB
    setSaveResults(null);
    
    // 6. Xóa dữ liệu preview (chứa password đã generate)
    setPreviewData(null);
    
    // 7. Reset role đã chọn về trạng thái ban đầu
    setSelectedRoleId('');
    
    // 8. Đóng modal xác nhận thêm vào hệ thống (nếu đang mở)
    setShowConfirmModal(false);
    
    // 9. Reset giá trị của input file về rỗng
    // Điều này quan trọng vì nếu không reset, khi chọn lại file cùng tên,
    // event onChange sẽ không được trigger (trình duyệt nghĩ rằng file không thay đổi)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Hàm export dữ liệu ra file Excel
  const handleExportExcel = () => {
    if (!saveResults || !saveResults.results?.success || saveResults.results.success.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    try {
      // Lấy roleId và roleName
      const roleId = saveResults.roleId || previewData?.roleId || selectedRoleId;
      const roleName = roles.find(r => r._id === roleId)?.name || roles.find(r => r._id === roleId)?.roleName || roleId || 'N/A';

      // Chuẩn bị dữ liệu để export
      const exportData = saveResults.results.success.map((user, index) => {
        // Lấy password
        const password = saveResults.isPreview 
          ? user.password 
          : (saveResults.previewPasswords?.[user.email] || user.password || 'Đã lưu (không thể xem lại)');

        return {
          'STT': index + 1,
          'Email': user.email || '',
          'Username': user.username || '',
          'Role': roleName,
          'Password': password,
          'Phone': user.phone || '',
          'Address': user.address || ''
        };
      });

      // Tạo workbook và worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách tài khoản');

      // Điều chỉnh độ rộng cột
      const colWidths = [
        { wch: 5 },  // STT
        { wch: 30 }, // Email
        { wch: 20 }, // Username
        { wch: 15 }, // Role
        { wch: 15 }, // Password
        { wch: 15 }, // Phone
        { wch: 40 }  // Address
      ];
      ws['!cols'] = colWidths;

      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `Danh_sach_tai_khoan_${timestamp}.xlsx`;

      // Xuất file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      saveAs(blob, fileName);

      // Thông báo thành công
      const message = saveResults.isPreview 
        ? `Đã xuất thành công ${exportData.length} tài khoản (Preview) ra file Excel!\nVui lòng lưu file này trước khi thêm vào hệ thống.`
        : `Đã xuất thành công ${exportData.length} tài khoản ra file Excel!`;
      alert(message);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Có lỗi xảy ra khi xuất file Excel: ' + error.message);
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
                <div className="d-flex align-items-center justify-content-between mb-8">
                  <Form.Label className="fw-semibold mb-0">Chọn file Excel
                      <Button
                    size="sm"
                    onClick={() => setShowFormatModal(true)}
                    
                  >
                    <i className="fas fa-info-circle me-1"></i>
                    Lưu ý
                  </Button>
                  </Form.Label>
                
                </div>
                <Form.Control
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
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

          {/* 
            Hiển thị badge tên file với icon X để xóa file khi có file được chọn
            - Badge hiển thị tên file đã chọn với icon Excel
            - Icon X bên trong badge (màu trắng, có thể click) cho phép người dùng xóa file và reset toàn bộ state
            - Khi click vào icon X, hàm handleReset() sẽ được gọi để:
              + Xóa file khỏi state
              + Xóa tất cả dữ liệu đã parse (users, errors, duplicates)
              + Xóa kết quả preview/save
              + Reset role đã chọn
              + Clear input file để có thể chọn lại file
          */}
          {file && (
            <div className="mt-16">
              {/* Badge hiển thị tên file với icon X để xóa */}
              <Badge 
                bg="info" 
                className="d-inline-flex align-items-center px-12 py-6"
                style={{ fontSize: '14px', cursor: 'default' }}
              >
                <i className="fas fa-file-excel me-2"></i>
                <span className="me-2" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
                {/* Icon X có thể click để xóa file */}
                <span
                  onClick={handleReset}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  style={{ 
                    cursor: 'pointer',
                    marginLeft: '8px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    lineHeight: '1'
                  }}
                  title="Xóa file"
                >
                  <i className="fas fa-times" style={{ fontSize: '12px' }}></i>
                </span>
              </Badge>
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
              <Button
                variant="success"
                onClick={handleSave}
                disabled={!selectedRoleId || saving}
              >
                <i className="fas fa-eye me-2"></i>
                Preview
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Save Results / Preview */}
      {saveResults && (
        <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
          <Card.Body className="p-20">
            <div className="d-flex justify-content-between align-items-center mb-16">
              <h5 className="mb-0">
                {saveResults.isPreview ? 'Preview tài khoản (Chưa lưu vào hệ thống)' : 'Kết quả lưu tài khoản'}
              </h5>
              {saveResults.isPreview && (
                <Badge bg="warning" className="px-12 py-6">
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  Chưa lưu vào hệ thống
                </Badge>
              )}
            </div>

            {saveResults.isPreview && (
              <Alert variant="warning" className="mb-16">
                <strong>
                  <i className="fas fa-info-circle me-2"></i>
                  Lưu ý quan trọng:
                </strong>
                <ul className="mb-0 mt-8">
                  <li>Đây là preview của các tài khoản sẽ được tạo</li>
                  <li><strong>Vui lòng bấm nút "Xuất Excel" để tải file chứa thông tin các tài khoản </strong></li>
                </ul>
              </Alert>
            )}
            
            <Alert variant="success" className="mb-16">
              <strong>Số lượng tài khoản:</strong> {saveResults.success} tài khoản
            </Alert>

            {saveResults.failed > 0 && (
              <Alert variant="danger" className="mb-16">
                <strong>Thất bại:</strong> {saveResults.failed} tài khoản
              </Alert>
            )}

            {saveResults.results?.success && saveResults.results.success.length > 0 && (
              <div className="mb-16">
                <div className="d-flex justify-content-between align-items-center mb-8">
                  <h6 className="mb-0">
                    {saveResults.isPreview 
                      ? 'Tài khoản sẽ được tạo (Preview):' 
                      : 'Tài khoản đã tạo thành công:'}
                  </h6>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleExportExcel}
                    className="d-inline-flex align-items-center"
                  >
                    <i className="fas fa-file-excel me-2"></i>
                    Xuất Excel ({saveResults.results.success.length} tài khoản)
                  </Button>
                </div>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saveResults.results.success.map((user, index) => {
                        // Nếu là preview, dùng password từ user object
                        // Nếu đã lưu DB, dùng password từ previewPasswords hoặc từ response
                        const password = saveResults.isPreview 
                          ? user.password 
                          : (saveResults.previewPasswords?.[user.email] || user.password || 'Đã lưu (không thể xem lại)');
                        
                        // Lấy roleId từ saveResults, previewData, hoặc selectedRoleId
                        const roleId = saveResults.roleId || previewData?.roleId || selectedRoleId || user.roleId;
                        
                        // Tìm tên role từ mảng roles
                        const roleName = roles.find(r => r._id === roleId)?.name || roles.find(r => r._id === roleId)?.roleName || roleId || 'N/A';
                        
                        return (
                          <tr key={index}>
                            <td>{user.email}</td>
                            <td>{user.username}</td>
                            <td>
                              <Badge bg="info">{roleName}</Badge>
                            </td>
                            <td className="fw-bold text-success">
                              {saveResults.isPreview ? password : (password.includes('không thể xem lại') ? (
                                <span className="text-muted">{password}</span>
                              ) : password)}
                            </td>
                          </tr>
                        );
                      })}
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

            {/* Nút Thêm vào hệ thống (chỉ hiện khi là preview) */}
            {saveResults.isPreview && (
              <div className="mt-16 text-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={saving}
                  className="px-24 py-12"
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-database me-2"></i>
                      Thêm vào hệ thống
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Modal xác nhận thêm vào hệ thống */}
      <Modal 
        show={showConfirmModal} 
        onHide={() => setShowConfirmModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Xác nhận thêm tài khoản vào hệ thống
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-16">
            <h6 className="fw-bold mb-12">
              <i className="fas fa-info-circle me-2"></i>
              Cảnh báo quan trọng
            </h6>
            <p className="mb-8">
              <strong>Hãy đảm bảo chắc chắn bạn đã lưu thông tin tài khoản và mật khẩu.</strong>
            </p>
            <p className="mb-0">
              Sau khi thêm vào hệ thống, bạn sẽ <strong className="text-danger">KHÔNG THỂ</strong> truy xuất lại thông tin mật khẩu nữa.
            </p>
          </Alert>

          <div className="mb-16">
            <p className="mb-8"><strong>Thông tin sẽ được thêm:</strong></p>
            <ul>
              <li>Số lượng tài khoản: <strong>{previewData?.total || 0}</strong></li>
              <li>Role: <strong>{roles.find(r => r._id === previewData?.roleId)?.name || previewData?.roleId}</strong></li>
            </ul>
          </div>

          <Alert variant="info" className="mb-0">
            <p className="mb-0">
              <i className="fas fa-check-circle me-2"></i>
              Bạn đã lưu lại tất cả thông tin tài khoản vừa tạo chưa?
            </p>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            <i className="fas fa-times me-2"></i>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleConfirmSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Xác nhận thêm vào hệ thống
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal hiển thị format mẫu */}
      <Modal 
        show={showFormatModal} 
        onHide={() => setShowFormatModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-info-circle me-2 text-info"></i>
            Định dạng file Excel mẫu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-16">
            <p className="fw-semibold text-primary mb-16" style={{ fontSize: '16px' }}>
              Hãy để định dạng giống thế này
            </p>
            <div className="border rounded p-16 bg-light" style={{ overflow: 'auto' }}>
              <img 
                src="/assets/images/Screenshot%202025-11-09%20182157.png" 
                alt="Định dạng Excel mẫu" 
                className="img-fluid"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto'
                }}
                onError={(e) => {
                  console.error('Error loading image:', e);
                  // Thử đường dẫn với khoảng trắng
                  if (e.target.src.includes('%20')) {
                    e.target.src = '/assets/images/Screenshot 2025-11-09 182157.png';
                  } else {
                    e.target.style.display = 'none';
                    const errorDiv = e.target.nextElementSibling;
                    if (errorDiv) {
                      errorDiv.style.display = 'block';
                    }
                  }
                }}
              />
              <div style={{ display: 'none' }} className="text-danger text-center p-16">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Không thể tải ảnh mẫu. Vui lòng kiểm tra đường dẫn file.
              </div>
            </div>
            <div className="mt-16 text-start">
              <Alert variant="info" className="mb-0">
                <strong>Lưu ý:</strong>
                <ul className="mb-0 mt-8">
                  <li>File Excel phải có header ở dòng đầu tiên: <code>email</code>, <code>username</code>, <code>phone</code>, <code>address</code></li>
                  <li>Các cột có thể viết hoa hoặc viết thường (Email, email, EMAIL đều được)</li>
                  <li>Dữ liệu bắt đầu từ dòng thứ 2</li>
                  <li>Email phải đúng định dạng email hợp lệ</li>
                  <li>Phone và address không được để trống</li>
                </ul>
              </Alert>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFormatModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BulkUserUploadPage;

