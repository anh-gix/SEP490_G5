import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';
import teacherService from '../../services/teacherService';
import * as XLSX from 'xlsx';

/**
 * Import Student From Excel Component
 * Component để import học viên từ file Excel
 */
const ImportStudentFromExcel = () => {
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
      alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      e.target.value = '';
      return;
    }

    setImportFile(file);
    setPreviewStudents([]);
  };

  const handlePreviewExcel = async () => {
    if (!importFile) {
      alert('Vui lòng chọn file Excel');
      return;
    }

    setImporting(true);
    try {
      // Read file as array buffer
      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Get first sheet
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        alert('File Excel không có sheet nào');
        setImporting(false);
        return;
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        alert('Sheet đầu tiên không có dữ liệu');
        setImporting(false);
        return;
      }

      // Get range of worksheet
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // First, get headers to find phone column index
      const headerRow = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        headerRow.push(cell ? (cell.w || cell.v || '') : '');
      }
      
      const phoneHeaderIndex = headerRow.findIndex(h => 
        h && (h.toString().toLowerCase().includes('phone') || 
              h.toString().toLowerCase().includes('số điện thoại') ||
              h.toString().toLowerCase().includes('điện thoại'))
      );

      // Convert to JSON (array of objects) - use raw: true to get raw values
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        raw: true, 
        defval: ''
      });

      if (!jsonData || jsonData.length === 0) {
        alert('File Excel không có dữ liệu');
        setImporting(false);
        return;
      }

      // Helper function to get band order for comparison
      const getLevelOrder = (level) => {
        const levelMap = {
          'Pre-A1': 0,
          'A1': 1,
          'A2': 2,
          'B1': 3,
          'B2': 4,
          'C1': 5,
          'C2': 6
        };
        return levelMap[level] !== undefined ? levelMap[level] : -1;
      };

      // Helper function to get band name from order
      const getLevelName = (order) => {
        const levelMap = {
          0: 'Pre-A1',
          1: 'A1',
          2: 'A2',
          3: 'B1',
          4: 'B2',
          5: 'C1',
          6: 'C2'
        };
        return levelMap[order] || '';
      };

      // Helper function to validate score by type
      const validateScore = (score, type) => {
        if (!score || !type) return false;
        
        const scoreStr = score.toString().trim();
        if (type === 'ielts') {
          const num = parseFloat(scoreStr);
          return !isNaN(num) && num >= 0 && num <= 9.0;
        } else if (type === 'toeic') {
          const num = parseInt(scoreStr);
          return !isNaN(num) && num >= 0 && num <= 990;
        }
        return false;
      };

      // Helper function to check if a value is numeric (score) or CEFR level
      const isNumericScore = (value) => {
        if (!value) return false;
        const valueStr = value.toString().trim();
        // Check if it's a number (can be integer or decimal)
        return /^\d+(\.\d+)?$/.test(valueStr);
      };

      // Helper function to calculate bands to study from currentLevel to aim
      const calculateLevelsToStudy = (currentLevel, aim, type) => {
        if (!currentLevel || !aim) return '';
        
        const currentLevelStr = currentLevel.toString().trim();
        const aimStr = aim.toString().trim();
        const typeStr = type ? type.toString().trim().toLowerCase() : '';
        
        // Check if values are numeric scores
        const currentLevelIsNumeric = isNumericScore(currentLevelStr);
        const aimIsNumeric = isNumericScore(aimStr);
        
        if (typeStr && (currentLevelIsNumeric || aimIsNumeric)) {
          // For numeric scores, return a simple description
          return `${currentLevelStr} → ${aimStr}`;
        }
        
        // For CEFR levels, calculate progression
        const currentOrder = getLevelOrder(currentLevelStr);
        const aimOrder = getLevelOrder(aimStr);
        
        if (currentOrder === -1 || aimOrder === -1 || aimOrder <= currentOrder) {
          return '';
        }
        
        // Calculate all bands from currentLevel to aim (bao gồm cả currentLevel)
        const levelsToStudy = [];
        for (let order = currentOrder; order <= aimOrder; order++) {
          const levelName = getLevelName(order);
          if (levelName) {
            levelsToStudy.push(levelName);
          }
        }
        
        return levelsToStudy.join(' → ');
      };

      // Parse and validate each row
      const previewData = [];
      jsonData.forEach((row, index) => {
        const rowNumber = index + 2; // +2 vì có header và index bắt đầu từ 0
        const errors = [];

        // Get data from Excel (support both Vietnamese and English)
        const username = row.username || row.Username || row['Tên đăng nhập'] || row['username'] || '';
        const email = row.email || row.Email || row['Email'] || '';
        let phone = row.phone || row.Phone || row['Số điện thoại'] || row['Điện thoại'] || '';
        
        // Convert phone to string first
        phone = phone ? String(phone) : '';
        phone = phone.trim();
        
        // Remove any non-digit characters (spaces, dashes, etc.)
        phone = phone.replace(/\D/g, '');
        
        // Always add leading zero if phone doesn't start with 0
        // This handles the case where Excel removes leading zeros from phone numbers
        if (phone && phone.length > 0 && phone[0] !== '0') {
          phone = '0' + phone;
        }
        
        const address = row.address || row.Address || row['Địa chỉ'] || '';
        
        // Parse new columns (support both Vietnamese and English)
        const aim = row.aim || row.Aim || row['Điểm mục tiêu'] || row['Mục tiêu'] || '';
        const currentLevel = row.currentLevel || row.CurrentLevel || row['Trình độ hiện tại'] || row['Trình độ'] || '';
        const type = row.type || row.Type || row['Loại'] || row['Chương trình'] || '';

        // Validate
        if (!username || !username.toString().trim()) {
          errors.push('Username không được để trống');
        }

        if (!email || !email.toString().trim()) {
          errors.push('Email không được để trống');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toString())) {
          errors.push('Email không hợp lệ');
        }

        if (!phone || !phone.toString().trim()) {
          errors.push('Số điện thoại không được để trống');
        }

        if (!address || !address.toString().trim()) {
          errors.push('Địa chỉ không được để trống');
        }

        // Validate aim and currentLevel based on type
        if (aim && currentLevel) {
          const aimStr = aim.toString().trim();
          const currentLevelStr = currentLevel.toString().trim();
          const typeStr = type ? type.toString().trim().toLowerCase() : '';
          
          // Check if values are numeric scores or CEFR levels
          const aimIsNumeric = isNumericScore(aimStr);
          const currentLevelIsNumeric = isNumericScore(currentLevelStr);
          
          if (typeStr && (aimIsNumeric || currentLevelIsNumeric)) {
            // Validate as numeric scores based on type
            if (!validateScore(aimStr, typeStr)) {
              errors.push(`Điểm mục tiêu không hợp lệ cho ${typeStr.toUpperCase()}. ${typeStr === 'ielts' ? 'Phải là số từ 0.0 đến 9.0' : 'Phải là số từ 0 đến 990'}`);
            } else if (!validateScore(currentLevelStr, typeStr)) {
              errors.push(`Trình độ hiện tại không hợp lệ cho ${typeStr.toUpperCase()}. ${typeStr === 'ielts' ? 'Phải là số từ 0.0 đến 9.0' : 'Phải là số từ 0 đến 990'}`);
            } else {
              // Compare numeric scores
              const aimNum = typeStr === 'ielts' ? parseFloat(aimStr) : parseInt(aimStr);
              const currentLevelNum = typeStr === 'ielts' ? parseFloat(currentLevelStr) : parseInt(currentLevelStr);
              
              if (aimNum <= currentLevelNum) {
                errors.push('Điểm mục tiêu phải cao hơn trình độ hiện tại');
              }
            }
          } else {
            // Validate as CEFR levels (backward compatibility)
            const aimOrder = getLevelOrder(aimStr);
            const currentLevelOrder = getLevelOrder(currentLevelStr);
            
            if (aimOrder === -1) {
              errors.push('Band mục tiêu không hợp lệ');
            } else if (currentLevelOrder === -1) {
              errors.push('Trình độ hiện tại không hợp lệ');
            } else if (aimOrder <= currentLevelOrder) {
              errors.push('Band mục tiêu phải cao hơn trình độ hiện tại');
            }
          }
        }

        // Calculate bands to study
        const levelsToStudy = calculateLevelsToStudy(
          currentLevel ? currentLevel.toString().trim() : '',
          aim ? aim.toString().trim() : '',
          type ? type.toString().trim() : ''
        );

        previewData.push({
          rowNumber,
          username: username.toString().trim(),
          email: email.toString().trim(),
          phone: phone.toString().trim(),
          address: address.toString().trim(),
          aim: aim ? aim.toString().trim() : '',
          currentLevel: currentLevel ? currentLevel.toString().trim() : '',
          type: type ? type.toString().trim() : '',
          levelsToStudy: levelsToStudy,
          hasError: errors.length > 0,
          errors
        });
      });

      // Normalize phone numbers - ensure they all have leading zero for comparison
      const normalizePhone = (phone) => {
        if (!phone) return '';
        const phoneStr = String(phone).replace(/\D/g, ''); // Remove all non-digits
        if (phoneStr && phoneStr.length > 0 && phoneStr[0] !== '0') {
          return '0' + phoneStr;
        }
        return phoneStr;
      };

      // Check for duplicates within the Excel file
      const emailMap = new Map();
      const phoneMap = new Map();
      
      console.log('=== Checking duplicates in Excel file ===');
      console.log('Total rows:', previewData.length);
      
      previewData.forEach((item, index) => {
        const email = item.email.toLowerCase();
        // Normalize phone before checking duplicates
        const phone = normalizePhone(item.phone);
        
        console.log(`Row ${index + 1}: email="${email}", phone="${item.phone}" -> normalized="${phone}"`);
        
        // Check duplicate email in file
        if (email && emailMap.has(email)) {
          const firstIndex = emailMap.get(email);
          console.log(`  -> Email duplicate found! First at row ${firstIndex + 1}`);
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
        
        // Check duplicate phone in file
        if (phone && phoneMap.has(phone)) {
          const firstIndex = phoneMap.get(phone);
          console.log(`  -> Phone duplicate found! First at row ${firstIndex + 1}, phone="${phone}"`);
          if (!previewData[firstIndex].errors.includes('Số điện thoại trùng lặp trong file Excel')) {
            previewData[firstIndex].errors.push('Số điện thoại trùng lặp trong file Excel');
            previewData[firstIndex].hasError = true;
          }
          if (!item.errors.includes('Số điện thoại trùng lặp trong file Excel')) {
            item.errors.push('Số điện thoại trùng lặp trong file Excel');
            item.hasError = true;
          }
        } else if (phone) {
          phoneMap.set(phone, index);
        }
      });
      
      console.log('Email map:', Array.from(emailMap.keys()));
      console.log('Phone map:', Array.from(phoneMap.keys()));
      console.log('=== End checking duplicates ===');

      // Check for duplicates with existing data in database
      try {
        // Get all students and teachers from database
        const [studentsResponse, teachersResponse] = await Promise.all([
          studentService.getAllStudents().catch(() => ({ students: [] })),
          teacherService.getAllTeachers().catch(() => ({ teachers: [] }))
        ]);
        
        const allStudents = studentsResponse.students || [];
        const allTeachers = teachersResponse.teachers || [];
        const allUsers = [...allStudents, ...allTeachers];
        
        console.log('=== Checking duplicates with database ===');
        console.log('Students in DB:', allStudents.length);
        console.log('Teachers in DB:', allTeachers.length);
        console.log('Total users in DB:', allUsers.length);
        
        const existingEmails = new Set(allUsers.map(u => u.email?.toLowerCase()).filter(Boolean));
        
        const existingPhones = new Set(
          allUsers
            .map(u => normalizePhone(u.phone))
            .filter(Boolean)
        );
        
        console.log('Existing emails in DB:', Array.from(existingEmails));
        console.log('Existing phones in DB:', Array.from(existingPhones));
        
        previewData.forEach((item) => {
          const email = item.email.toLowerCase();
          const phone = normalizePhone(item.phone);
          
          console.log(`Checking row: email="${email}", phone="${phone}"`);
          
          if (email && existingEmails.has(email)) {
            console.log(`  -> Email "${email}" found in DB!`);
            item.errors.push('Email đã tồn tại trong hệ thống');
            item.hasError = true;
          }
          
          if (phone && existingPhones.has(phone)) {
            console.log(`  -> Phone "${phone}" found in DB!`);
            item.errors.push('Số điện thoại đã tồn tại trong hệ thống');
            item.hasError = true;
          }
        });
        
        console.log('=== End checking duplicates with database ===');
      } catch (err) {
        console.error('Error checking existing users:', err);
      }

      setPreviewStudents(previewData);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      alert('Lỗi khi đọc file Excel: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    const validStudents = previewStudents.filter(s => !s.hasError);
    
    if (validStudents.length === 0) {
      alert('Không có học viên hợp lệ để import');
      return;
    }

    try {
      setLoading(true);
      const result = await studentService.importStudents(validStudents);
      
      alert(`Import thành công: ${result.success} học viên\nThất bại: ${result.failed} học viên`);
      
      // Navigate back to student management page after successful import
      navigate('/academic/student-management');
    } catch (err) {
      console.error('Error importing students:', err);
      const errorMessage = err.message || (typeof err === 'string' ? err : 'Không thể import học viên');
      alert(errorMessage);
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
        address: '123 Đường ABC, Quận 1, TP.HCM',
        aim: '6.0',
        currentLevel: '4.0',
        type: 'ielts'
      },
      {
        username: 'student2',
        email: 'student2@email.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        aim: '600',
        currentLevel: '400',
        type: 'toeic'
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
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
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Import Học viên từ Excel</h4>
          <p className="text-neutral-600 mb-0">Nhập danh sách học viên từ file Excel</p>
        </div>
        <Button 
          variant="secondary"
          className="px-20 py-10 radius-8"
          onClick={() => navigate('/academic/student-management')}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại
        </Button>
      </div>

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
            Lưu ý: Password sẽ tự động được tạo cho mỗi học viên
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
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Aim</th>
                <th>Trình độ hiện tại</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>student1</td>
                <td>student1@email.com</td>
                <td>0123456789</td>
                <td>123 Đường ABC</td>
                <td>6.0</td>
                <td>4.0</td>
                <td>ielts</td>
              </tr>
              <tr>
                <td>student2</td>
                <td>student2@email.com</td>
                <td>0987654321</td>
                <td>456 Đường XYZ</td>
                <td>600</td>
                <td>400</td>
                <td>toeic</td>
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
                    <th>Aim</th>
                    <th>Trình độ hiện tại</th>
                    <th>Lộ trình học</th>
                    <th>Type</th>
                    <th>Trạng thái</th>
                    <th>Lỗi</th>
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
                      <td>{student.aim || '-'}</td>
                      <td>{student.currentLevel || '-'}</td>
                      <td>{student.levelsToStudy || '-'}</td>
                      <td>{student.type || '-'}</td>
                      <td>
                        {student.hasError ? (
                          <Badge bg="danger">Lỗi</Badge>
                        ) : (
                          <Badge bg="success">Hợp lệ</Badge>
                        )}
                      </td>
                      <td>
                        {student.errors.length > 0 ? (
                          <ul className="mb-0" style={{ fontSize: '12px', paddingLeft: '20px' }}>
                            {student.errors.map((error, i) => (
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

      {/* Footer Actions */}
      {previewStudents.length > 0 && (
        <Card className="mt-3">
          <Card.Body>
            <div className="d-flex justify-content-end gap-3">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/academic/student-management')} 
                disabled={loading || importing}
              >
                Hủy
              </Button>
              <Button
                variant="success"
                onClick={handleConfirmImport}
                disabled={previewStudents.filter(s => !s.hasError).length === 0 || loading || importing}
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

