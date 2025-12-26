import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';
import teacherService from '../../services/teacherService';
import * as XLSX from 'xlsx';

/**
 * Import Student From Excel Component
 * Component để import học viên từ file Excel
 * @param {function} onBack - Callback để quay lại danh sách (optional, fallback to navigate)
 */
const ImportStudentFromExcel = ({ onBack }) => {
  const navigate = useNavigate();
  const [importFile, setImportFile] = useState(null);
  const [previewStudents, setPreviewStudents] = useState([]);
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const isValidType = validTypes.includes(file.type) ||
                       file.name.endsWith('.xlsx') ||
                       file.name.endsWith('.xls');

    if (!isValidType) {
      toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      e.target.value = '';
      return;
    }

    setImportFile(file);
    setPreviewStudents([]);
  };

  const handlePreviewExcel = async () => {
    if (!importFile) {
      toast.warning('Vui lòng chọn file Excel');
      return;
    }

    setImporting(true);
    try {
      // Read file as array buffer
      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Get first sheet
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        toast.error('File Excel không có sheet nào');
        setImporting(false);
        return;
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        toast.error('Sheet đầu tiên không có dữ liệu');
        setImporting(false);
        return;
      }

      // Convert to JSON (array of objects)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: true,
        defval: ''
      });

      if (!jsonData || jsonData.length === 0) {
        toast.error('File Excel không có dữ liệu');
        setImporting(false);
        return;
      }

      // Parse and validate each row
      const previewData = [];
      jsonData.forEach((row, index) => {
        const rowNumber = index + 2; // +2 vì có header và index bắt đầu từ 0
        const errors = [];

        // Get data from Excel (support both Vietnamese and English)
        const username = row.username || row.Username || row['Tên đăng nhập'] || '';
        const email = row.email || row.Email || '';
        let phone = row.phone || row.Phone || row['Số điện thoại'] || '';
        const address = row.address || row.Address || row['Địa chỉ'] || '';

        // Validate username
        if (!username || username.toString().trim() === '') {
          errors.push('Tên đăng nhập không được để trống');
        }

        // Validate email
        if (!email || email.toString().trim() === '') {
          errors.push('Email không được để trống');
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email.toString().trim())) {
            errors.push('Email không đúng định dạng');
          }
        }

        // Validate phone (optional but if provided must be valid)
        if (phone && phone.toString().trim()) {
          const phoneDigits = phone.toString().replace(/\D/g, '');
          if (phoneDigits.length !== 9 && phoneDigits.length !== 10) {
            errors.push('Số điện thoại phải có 9 hoặc 10 chữ số');
          }
        }

        previewData.push({
          rowNumber,
          username: username.toString().trim(),
          email: email.toString().trim(),
          phone: phone.toString().trim(),
          address: address.toString().trim(),
          hasError: errors.length > 0,
          errors
        });
      });

      // Check duplicate với database
      try {
        const [studentsResponse, teachersResponse] = await Promise.all([
          studentService.getAllStudents().catch(() => ({ students: [] })),
          teacherService.getAllTeachers().catch(() => ({ teachers: [] }))
        ]);

        const allStudents = studentsResponse.students || [];
        const allTeachers = teachersResponse.teachers || [];
        const allUsers = [...allStudents, ...allTeachers];

        const existingEmails = new Set(
          allUsers.map(u => u.email?.toLowerCase()).filter(Boolean)
        );

        // Add errors for existing emails
        previewData.forEach(item => {
          if (item.email && existingEmails.has(item.email.toLowerCase())) {
            item.errors.push('Email đã tồn tại trong hệ thống');
            item.hasError = true;
          }
        });

        // Check duplicate email trong file
        const emailMap = new Map();
        previewData.forEach((item, index) => {
          const email = item.email.toLowerCase();
          if (email && emailMap.has(email)) {
            const firstIndex = emailMap.get(email);
            if (!previewData[firstIndex].errors.includes('Email trùng lặp trong file Excel')) {
              previewData[firstIndex].errors.push('Email trùng lặp trong file Excel');
              previewData[firstIndex].hasError = true;
            }
            if (!item.errors.includes('Email trùng lặp trong file Excel')) {
              item.errors.push('Email trùng lặp trong file Excel');
              item.hasError = true;
            }
          } else if (email) {
            emailMap.set(email, index);
          }
        });
      } catch (error) {
        console.error('Error checking existing data:', error);
      }

      setPreviewStudents(previewData);
      toast.success(`Đã tải ${previewData.length} học viên từ file Excel`);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error('Lỗi khi đọc file Excel: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    const validStudents = previewStudents.filter(s => !s.hasError);

    if (validStudents.length === 0) {
      toast.warning('Không có học viên hợp lệ để import');
      return;
    }

    try {
      setLoading(true);
      const result = await studentService.importStudents(validStudents);

      const successCount = result.successCount || result.results?.success?.length || 0;
      const failedCount = result.failedCount || result.results?.failed?.length || 0;

      const message = `Import thành công ${successCount} học viên, thất bại ${failedCount} học viên`;

      toast.success(message, { autoClose: 5000 });

      // Navigate back to student management page after successful import
      if (onBack) {
        onBack();
      } else {
        navigate('/academic/student-management');
      }
    } catch (err) {
      const errorMessage = err.message || (typeof err === 'string' ? err : 'Không thể import học viên');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create sample data
    const sampleData = [
      {
        username: 'student1',
        email: 'student1@email.com',
        phone: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM'
      },
      {
        username: 'student2',
        email: 'student2@email.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Quận 2, TP.HCM'
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Find phone column index
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    let phoneColIndex = -1;

    // Find phone column (check header row)
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = ws[cellAddress];
      if (cell && (cell.v === 'phone' || cell.v === 'Phone' || cell.v === 'Số điện thoại')) {
        phoneColIndex = col;
        break;
      }
    }

    // Format phone column as text
    if (phoneColIndex >= 0) {
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: phoneColIndex });
        if (ws[cellAddress]) {
          // Set cell type to string and ensure value is string
          ws[cellAddress].t = 's'; // 's' = string type
          ws[cellAddress].v = String(ws[cellAddress].v);
          // Set cell style to text format
          ws[cellAddress].z = '@'; // '@' = text format in Excel
        }
      }
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học viên');

    // Generate file name with timestamp
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `Mau_Import_Hoc_Vien_${timestamp}.xlsx`;

    // Write and download
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-3">
        <Col>
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  navigate('/academic/student-management');
                }
              }}
              className="me-3"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại
            </Button>
            <h4 className="mb-0">Import Học viên từ Excel</h4>
          </div>
        </Col>
      </Row>

      {/* Phần 1: Hướng dẫn Format Excel */}
      <Card className="mb-3 border-info">
        <Card.Body className="bg-info bg-opacity-10">
          <h6 className="mb-3">
            <i className="fas fa-info-circle me-2"></i>
            Hướng dẫn Format Excel
          </h6>
          <p className="mb-2">Vui lòng đảm bảo file Excel của bạn có đúng format như bảng dưới đây:</p>
          <p className="mb-3 text-muted">
            Lưu ý: Password sẽ tự động được tạo cho mỗi học viên (mặc định: 123456)
          </p>

          <div className="mb-3">
            <Button
              variant="outline-success"
              size="sm"
              onClick={handleDownloadTemplate}
            >
              <i className="fas fa-download me-2"></i>
              Tải file mẫu
            </Button>
          </div>

          <Table striped bordered size="sm" className="mb-0">
            <thead className="table-info">
              <tr>
                <th>username</th>
                <th>email</th>
                <th>phone</th>
                <th>address</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>student1</td>
                <td>student1@email.com</td>
                <td>0123456789</td>
                <td>123 Đường ABC, Quận 1, TP.HCM</td>
              </tr>
              <tr>
                <td>student2</td>
                <td>student2@email.com</td>
                <td>0987654321</td>
                <td>456 Đường XYZ, Quận 2, TP.HCM</td>
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
              onChange={handleFileSelect}
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
              onClick={handlePreviewExcel}
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
      {previewStudents.length > 0 && (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Preview dữ liệu</h6>
              <div>
                <Badge bg="secondary" className="me-2">
                  Tổng số: {previewStudents.length}
                </Badge>
                <Badge bg="success" className="me-2">
                  Hợp lệ: {previewStudents.filter(s => !s.hasError).length}
                </Badge>
                <Badge bg="danger">
                  Lỗi: {previewStudents.filter(s => s.hasError).length}
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
                  </tr>
                </thead>
                <tbody>
                  {previewStudents.map((student, index) => (
                    <tr
                      key={index}
                      className={student.hasError ? 'table-danger' : 'table-success'}
                    >
                      <td>{student.rowNumber}</td>
                      <td>{student.username}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>{student.address}</td>
                      <td>
                        {student.hasError ? (
                          <div>
                            <Badge bg="danger">Lỗi</Badge>
                            {student.errors.length > 0 && (
                              <ul className="mb-0 mt-1" style={{ fontSize: '12px', paddingLeft: '20px' }}>
                                {student.errors.map((error, i) => (
                                  <li key={i} className="text-danger">{error}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Badge bg="success">Hợp lệ</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setImportFile(null);
                  setPreviewStudents([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                variant="success"
                onClick={handleConfirmImport}
                disabled={previewStudents.filter(s => !s.hasError).length === 0 || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang import...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Xác nhận và Import
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ImportStudentFromExcel;
