import React, { useState, useRef } from 'react';
import { Modal, Button, Table, Badge, Alert, Card } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import teacherService from '../../../../services/teacherService';

/* eslint-disable no-unused-vars */
const ImportMocktestScoresModal = ({ show, onHide, classInfo, students = [], scheduleId, mocktestOrder, onImportSuccess }) => {
  const [importFile, setImportFile] = useState(null);
  const [previewScores, setPreviewScores] = useState([]);
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Debug props
  console.log('🎯 Modal Props:', { scheduleId, mocktestOrder, classId: classInfo?._id });

  // Get program type from classInfo
  const programType = classInfo?.course?.program?.type?.toLowerCase() || 'ielts';

  // Validation rules based on program type
  const getValidationRules = () => {
    switch (programType) {
      case 'ielts':
        return {
          skills: ['reading', 'listening', 'writing', 'speaking'],
          labels: { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' },
          min: 1,
          max: 9,
          step: 0.5,
          validateScore: (score) => {
            const num = parseFloat(score);
            if (isNaN(num)) return false;
            if (num < 1 || num > 9) return false;
            // Check if it's a valid step (0.0 or 0.5)
            const decimal = (num % 1).toFixed(1);
            return decimal === '0.0' || decimal === '0.5';
          },
          formatScore: (score) => parseFloat(score).toFixed(1)
        };
      case 'toeic':
        return {
          skills: ['listening', 'reading'],
          labels: { listening: 'Listening', reading: 'Reading' },
          min: 10,
          max: 495,
          step: 5,
          validateScore: (score, skill) => {
            const num = parseInt(score);
            if (isNaN(num)) return false;
            if (num < 10 || num > 495) return false;
            // TOEIC scores should be multiples of 5
            return num % 5 === 0;
          },
          formatScore: (score) => parseInt(score).toString()
        };
      case 'cam':
      case 'cambridge':
        return {
          skills: ['readingWriting', 'listening'],
          labels: { readingWriting: 'Reading & Writing', listening: 'Listening' },
          min: 1,
          max: 15,
          step: 1,
          validateScore: (score) => {
            const num = parseInt(score);
            if (isNaN(num)) return false;
            return num >= 1 && num <= 15 && Number.isInteger(num);
          },
          formatScore: (score) => parseInt(score).toString()
        };
      default:
        return getValidationRules(); // Default to IELTS
    }
  };

  const rules = getValidationRules();

  // Download template Excel based on program type
  const handleDownloadTemplate = () => {
    if (students.length === 0) {
      toast.warning('Lớp học chưa có học viên nào');
      return;
    }
    
    let templateData;
    
    // Helper function to get existing mocktest scores for a student
    const getExistingScores = (student) => {
      if (!student.mocktestScores || typeof student.mocktestScores !== 'object') {
        return null;
      }
      
      // mocktestScores is an object with keys like "mocktest5", "mocktest11"
      const key = `mocktest${mocktestOrder}`;
      const scoreData = student.mocktestScores[key];
      
      if (!scoreData) {
        return null;
      }
      
      // Return the score data (contains reading, listening, writing, speaking, totalScore, etc.)
      return scoreData;
    };
    
    switch (programType) {
      case 'ielts':
        templateData = students.map((student, idx) => {
          const existingScores = getExistingScores(student);
          return {
            'STT': idx + 1,
            'Họ và tên': student.username || student.name || '',
            'Email': student.email || '',
            'Reading': existingScores?.skillScores?.reading || '',
            'Listening': existingScores?.skillScores?.listening || '',
            'Writing': existingScores?.skillScores?.writing || '',
            'Speaking': existingScores?.skillScores?.speaking || ''
          };
        });
        break;
      
      case 'toeic':
        templateData = students.map((student, idx) => {
          const existingScores = getExistingScores(student);
          return {
            'STT': idx + 1,
            'Họ và tên': student.username || student.name || '',
            'Email': student.email || '',
            'Listening': existingScores?.skillScores?.listening || '',
            'Reading': existingScores?.skillScores?.reading || ''
          };
        });
        break;
      
      case 'cam':
      case 'cambridge':
        templateData = students.map((student, idx) => {
          const existingScores = getExistingScores(student);
          return {
            'STT': idx + 1,
            'Họ và tên': student.username || student.name || '',
            'Email': student.email || '',
            'Reading & Writing': existingScores?.skillScores?.reading || '',
            'Listening': existingScores?.skillScores?.listening || ''
          };
        });
        break;
      
      default:
        toast.error('Loại chương trình không hợp lệ');
        return;
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Auto-size columns
    const colWidths = [
      { wch: 5 },  // STT
      { wch: 25 }, // Họ và tên
      { wch: 30 }, // Email
      { wch: 12 }, // Score columns
      { wch: 12 },
      { wch: 12 },
      { wch: 12 }
    ];
    ws['!cols'] = colWidths;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm Mocktest');

    // Generate file name with class name and mocktest info
    const programName = programType.toUpperCase();
    const className = classInfo?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Class';
    const mocktestLabel = mocktestOrder ? `MT${mocktestOrder}` : 'Mocktest';
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `Diem_${programName}_${className}_${mocktestLabel}_${timestamp}.xlsx`;

    // Download
    XLSX.writeFile(wb, fileName);
    toast.success(`Đã tải file điểm cho ${students.length} học viên`);
  };

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
    setPreviewScores([]);
  };

  const handlePreviewExcel = async () => {
    if (!importFile) {
      toast.warning('Vui lòng chọn file Excel');
      return;
    }

    setImporting(true);
    try {
      console.log('📊 Preview Excel - Students:', students.length);
      console.log('📊 Students data:', students);
      
      // Read file
      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

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

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        raw: true, 
        defval: ''
      });

      if (!jsonData || jsonData.length === 0) {
        toast.error('File Excel không có dữ liệu');
        setImporting(false);
        return;
      }

      // Get students from class
      const studentEmailMap = new Map();
      students.forEach(student => {
        console.log('🔍 Student object:', student); // Debug student structure
        const studentId = student._id || student.id; // Handle both _id and id
        studentEmailMap.set(student.email.toLowerCase(), {
          id: studentId,
          name: student.username || student.name,
          email: student.email
        });
      });

      console.log('📧 Student Email Map:', studentEmailMap);
      console.log('📧 Map size:', studentEmailMap.size);

      // Parse and validate each row
      const previewData = [];
      jsonData.forEach((row, index) => {
        const rowNumber = index + 2; // +2 because of header and 0-based index
        const errors = [];
        const warnings = [];

        // Get email
        const email = (row.Email || row.email || '').toString().trim().toLowerCase();
        
        console.log(`📝 Row ${rowNumber}:`, {
          rawEmail: row.Email || row.email,
          processedEmail: email,
          found: studentEmailMap.has(email)
        });

        if (!email) {
          errors.push('Email không được để trống');
        }

        // Check if student exists in class
        const studentInfo = studentEmailMap.get(email);
        if (email && !studentInfo) {
          errors.push('Email không tồn tại trong lớp học');
        }

        // Parse scores based on program type
        const scores = {};
        
        if (programType === 'ielts') {
          scores.reading = row.Reading || row.reading || '';
          scores.listening = row.Listening || row.listening || '';
          scores.writing = row.Writing || row.writing || '';
          scores.speaking = row.Speaking || row.speaking || '';
        } else if (programType === 'toeic') {
          scores.listening = row.Listening || row.listening || '';
          scores.reading = row.Reading || row.reading || '';
        } else if (programType === 'cam' || programType === 'cambridge') {
          scores.readingWriting = row['Reading & Writing'] || row.readingWriting || row['Reading&Writing'] || '';
          scores.listening = row.Listening || row.listening || '';
        }

        // Validate scores
        let hasScore = false;
        rules.skills.forEach(skill => {
          const score = scores[skill];
          if (score !== '' && score !== null && score !== undefined) {
            hasScore = true;
            if (!rules.validateScore(score, skill)) {
              const label = rules.labels[skill];
              if (programType === 'ielts') {
                errors.push(`${label}: Điểm phải từ 1.0 đến 9.0 (bội số 0.5)`);
              } else if (programType === 'toeic') {
                errors.push(`${label}: Điểm phải từ 10 đến 495 (bội số 5)`);
              } else {
                errors.push(`${label}: Điểm phải từ 1 đến 15 (số nguyên)`);
              }
            }
          }
        });

        if (!hasScore) {
          warnings.push('Chưa có điểm nào được nhập');
        }

        previewData.push({
          rowNumber,
          studentName: row['Họ và tên'] || row.name || '',
          email: (row.Email || row.email || '').toString().trim(),
          studentId: studentInfo?.id || null,
          scores,
          hasError: errors.length > 0,
          errors,
          warnings
        });
      });

      console.log('✅ Preview Data:', previewData);
      console.log('✅ Valid scores:', previewData.filter(s => !s.hasError && s.studentId).length);
      
      setPreviewScores(previewData);
      toast.success(`Đã tải ${previewData.length} dòng dữ liệu`);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error('Lỗi khi đọc file Excel: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    const validScores = previewScores.filter(s => !s.hasError && s.studentId);
    
    if (validScores.length === 0) {
      toast.warning('Không có điểm hợp lệ để import');
      return;
    }

    if (!scheduleId) {
      toast.error('Thiếu thông tin scheduleId. Vui lòng đóng modal và chọn lại mocktest session.');
      return;
    }

    try {
      setLoading(true);
      
      console.log('📤 Sending to API:', {
        classId: classInfo._id,
        scheduleId,
        scoresCount: validScores.length
      });
      
      // Prepare scores data for API
      const scoresData = validScores.map(item => {
        const scoreObj = {
          studentId: item.studentId,
          email: item.email
        };

        // Map scores based on program type
        if (programType === 'ielts') {
          scoreObj.reading = item.scores.reading !== '' ? parseFloat(item.scores.reading) : 0;
          scoreObj.listening = item.scores.listening !== '' ? parseFloat(item.scores.listening) : 0;
          scoreObj.writing = item.scores.writing !== '' ? parseFloat(item.scores.writing) : 0;
          scoreObj.speaking = item.scores.speaking !== '' ? parseFloat(item.scores.speaking) : 0;
        } else if (programType === 'toeic') {
          scoreObj.listening = item.scores.listening !== '' ? parseInt(item.scores.listening) : 0;
          scoreObj.reading = item.scores.reading !== '' ? parseInt(item.scores.reading) : 0;
          scoreObj.writing = 0;
          scoreObj.speaking = 0;
        } else if (programType === 'cam' || programType === 'cambridge') {
          scoreObj.reading = item.scores.readingWriting !== '' ? parseInt(item.scores.readingWriting) : 0;
          scoreObj.listening = item.scores.listening !== '' ? parseInt(item.scores.listening) : 0;
          scoreObj.writing = 0;
          scoreObj.speaking = 0;
        }

        return scoreObj;
      });

      const result = await teacherService.importMocktestScores(
        classInfo._id,
        scheduleId,
        scoresData
      );

      if (result.success) {
        const { successCount, failedCount } = result;
        toast.success(`Import thành công ${successCount} điểm!`);
        
        if (failedCount > 0) {
          toast.warning(`${failedCount} điểm không thể import`);
        }

        // Reset state
        setImportFile(null);
        setPreviewScores([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Callback to refresh data
        if (onImportSuccess) {
          onImportSuccess();
        }

        // Close modal after short delay
        setTimeout(() => {
          onHide();
        }, 1000);
      }
    } catch (error) {
      console.error('Error importing scores:', error);
      toast.error(error.message || 'Không thể import điểm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImportFile(null);
    setPreviewScores([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Import Điểm Mocktest - {programType.toUpperCase()}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Instructions */}
        <Card className="mb-3 border-info">
          <Card.Body className="bg-info bg-opacity-10">
            <h6 className="mb-3">
              <i className="fas fa-info-circle me-2"></i>
              Hướng dẫn Import Điểm
            </h6>
            <p className="mb-2">File Excel cần có các cột sau:</p>
            <ul className="mb-3">
              <li><strong>Email:</strong> Email của học viên (bắt buộc)</li>
              {programType === 'ielts' && (
                <>
                  <li><strong>Reading, Listening, Writing, Speaking:</strong> Điểm từ 1.0 đến 9.0 (bội số 0.5)</li>
                </>
              )}
              {programType === 'toeic' && (
                <>
                  <li><strong>Listening, Reading:</strong> Điểm từ 10 đến 495 (bội số 5)</li>
                </>
              )}
              {(programType === 'cam' || programType === 'cambridge') && (
                <>
                  <li><strong>Reading & Writing, Listening:</strong> Điểm từ 1 đến 15 (số nguyên)</li>
                </>
              )}
            </ul>
            <Button
              variant="outline-success"
              size="sm"
              onClick={handleDownloadTemplate}
            >
              <i className="fas fa-download me-2"></i>
              Tải file mẫu
            </Button>
          </Card.Body>
        </Card>

        {/* Upload Section */}
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
                    <i className="fas fa-eye me-2"></i>
                    Xem trước
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Preview Table */}
        {previewScores.length > 0 && (
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Preview dữ liệu ({previewScores.length} học viên)</h6>
                <div>
                  <Badge bg="success" className="me-2">
                    Hợp lệ: {previewScores.filter(s => !s.hasError && s.warnings.length === 0).length}
                  </Badge>
                  <Badge bg="warning" className="me-2">
                    Cảnh báo: {previewScores.filter(s => !s.hasError && s.warnings.length > 0).length}
                  </Badge>
                  <Badge bg="danger">
                    Lỗi: {previewScores.filter(s => s.hasError).length}
                  </Badge>
                </div>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table striped bordered hover size="sm">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>STT</th>
                      <th>Họ và tên</th>
                      <th>Email</th>
                      {rules.skills.map(skill => (
                        <th key={skill}>{rules.labels[skill]}</th>
                      ))}
                      <th>Trạng thái</th>
                      <th>Lỗi/Cảnh báo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewScores.map((item, index) => {
                      const hasWarnings = item.warnings.length > 0;
                      const rowClassName = item.hasError 
                        ? 'table-danger' 
                        : hasWarnings 
                          ? 'table-warning' 
                          : 'table-success';
                      
                      return (
                        <tr key={index} className={rowClassName}>
                          <td>{item.rowNumber}</td>
                          <td>{item.studentName}</td>
                          <td>{item.email}</td>
                          {rules.skills.map(skill => (
                            <td key={skill}>
                              {item.scores[skill] !== '' && item.scores[skill] !== null && item.scores[skill] !== undefined
                                ? item.scores[skill]
                                : '-'}
                            </td>
                          ))}
                          <td>
                            {item.hasError ? (
                              <Badge bg="danger">Lỗi</Badge>
                            ) : hasWarnings ? (
                              <Badge bg="warning">Cảnh báo</Badge>
                            ) : (
                              <Badge bg="success">Hợp lệ</Badge>
                            )}
                          </td>
                          <td>
                            {item.errors.length > 0 ? (
                              <ul className="mb-0" style={{ fontSize: '12px', paddingLeft: '20px' }}>
                                {item.errors.map((error, i) => (
                                  <li key={i} className="text-danger">{error}</li>
                                ))}
                              </ul>
                            ) : item.warnings.length > 0 ? (
                              <ul className="mb-0" style={{ fontSize: '12px', paddingLeft: '20px' }}>
                                {item.warnings.map((warning, i) => (
                                  <li key={i} className="text-warning">{warning}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading || importing}>
          Đóng
        </Button>
        {previewScores.length > 0 && (
          <Button
            variant="success"
            onClick={handleConfirmImport}
            disabled={previewScores.filter(s => !s.hasError && s.studentId).length === 0 || loading || importing}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Đang import...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Xác nhận Import ({previewScores.filter(s => !s.hasError && s.studentId).length} điểm)
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ImportMocktestScoresModal;
