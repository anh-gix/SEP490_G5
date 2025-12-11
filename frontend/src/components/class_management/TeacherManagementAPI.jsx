import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, InputGroup, Pagination, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import teacherService from '../../services/teacherService';
import studentService from '../../services/studentService';
import { courseService } from '../../services/courseService';
import * as XLSX from 'xlsx';

/**
 * Teacher Management Component with API Integration
 * Quản lý Giảng viên đầy đủ chức năng
 */
const TeacherManagementAPI = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [programType, setProgramType] = useState('');
  const [level, setLevel] = useState('');
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Import Excel states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [previewTeachers, setPreviewTeachers] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch program types and levels on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [typesResponse, levelsResponse] = await Promise.all([
          courseService.getAllTypes(),
          courseService.getAllLevels()
        ]);
        
        if (typesResponse?.success && typesResponse.types) {
          setAvailableTypes(typesResponse.types);
        }
        
        if (levelsResponse?.success && levelsResponse.levels) {
          setAvailableLevels(levelsResponse.levels);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Reset page when filters change (but not when page itself changes)
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, programType, level]);

  useEffect(() => {
    fetchTeachers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, programType, level, page]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 10
      };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      if (programType) params.programType = programType;
      if (level) params.level = level;
      
      const data = await teacherService.getAllTeachers(params);
      setTeachers(data.teachers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err.message || 'Không thể tải danh sách giảng viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await teacherService.getTeacherStats();
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const parseErrorToField = (errorMessage) => {
    const errors = {};
    if (!errorMessage) return errors;
    
    const message = typeof errorMessage === 'string' ? errorMessage : errorMessage.message || '';
    
    // Map error messages to form fields (check most specific first)
    if (message.includes('Số điện thoại đã tồn tại')) {
      errors.phone = message;
    } else if (message.includes('Email đã tồn tại')) {
      errors.email = message;
    } else if (message.includes('Username đã tồn tại')) {
      errors.username = message;
    } else if (message.toLowerCase().includes('số điện thoại') || message.toLowerCase().includes('phone')) {
      errors.phone = message;
    } else if (message.toLowerCase().includes('email')) {
      errors.email = message;
    } else if (message.toLowerCase().includes('username')) {
      errors.username = message;
    } else {
      // General error - show on submit
      errors.submit = message;
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    
    try {
      setLoading(true);
      await teacherService.createTeacher(formData);
      
      // Success - close modal and refresh
      toast.success('Thêm giảng viên thành công!');
      handleCloseModal();
      fetchTeachers();
      fetchStats();
    } catch (err) {
      console.error('Error saving teacher:', err);
      const errorMessage = err?.message || err?.response?.data?.message || 'Không thể lưu thông tin Giảng viên';
      const parsedErrors = parseErrorToField(errorMessage);
      setFormErrors(parsedErrors);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      phone: '',
      address: ''
    });
    setFormErrors({});
  };

  // Import Excel handlers
  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setImportFile(null);
    setPreviewTeachers([]);
    setImporting(false);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setPreviewTeachers([]);
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    setPreviewTeachers([]);
  };

  const handlePreviewExcel = async () => {
    if (!importFile) {
      toast.error('Vui lòng chọn file Excel');
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

      setPreviewTeachers(previewData);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      toast.error('Lỗi khi đọc file Excel: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    const validTeachers = previewTeachers.filter(t => !t.hasError);
    
    if (validTeachers.length === 0) {
      toast.error('Không có giảng viên hợp lệ để import');
      return;
    }

    try {
      setLoading(true);
      const result = await teacherService.importTeachers(validTeachers);
      
      toast.success(`Import thành công: ${result.successCount} giảng viên. Thất bại: ${result.failedCount} giảng viên`);
      
      handleCloseImportModal();
      fetchTeachers();
      fetchStats();
    } catch (err) {
      console.error('Error importing teachers:', err);
      const errorMessage = err.message || (typeof err === 'string' ? err : 'Không thể import giảng viên');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create sample data
    const sampleData = [
      {
        username: 'teacher1',
        email: 'teacher1@email.com',
        phone: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM'
      },
      {
        username: 'teacher2',
        email: 'teacher2@email.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Quận 2, TP.HCM'
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách giảng viên');

    // Generate file name with timestamp
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `Mau_Import_Giang_Vien_${timestamp}.xlsx`;

    // Write and download
    XLSX.writeFile(wb, fileName);
  };

  const handleViewDetail = (teacher) => {
    navigate(`/academic/teacher-management/${teacher._id}`);
  };

  const filteredTeachers = teachers;

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Quản lý Giảng viên</h4>
          <p className="text-neutral-600 mb-0">Quản lý thông tin và lịch giảng dạy</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            className="btn-main px-20 py-10 radius-8"
            onClick={() => setShowModal(true)}
            disabled={loading}
          >
            <i className="fas fa-plus me-2"></i>
            Thêm Giảng viên
          </Button>
          <Button 
            variant="success"
            className="px-20 py-10 radius-8"
            onClick={handleOpenImportModal}
            disabled={loading}
          >
            <i className="fas fa-file-excel me-2"></i>
            Import từ Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-24">
        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div 
                  className="rounded-12 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
                  }}
                >
                  <i className="fas fa-chalkboard-teacher text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng giảng viên</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.total || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
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
                  <i className="fas fa-door-open text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng lớp</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.totalClasses || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
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
                  <i className="fas fa-user-slash text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tạm nghỉ</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.inactive || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and View Toggle */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-20">
          <Row className="g-3 align-items-center">
            <Col md={2}>
              <InputGroup>
                <InputGroup.Text className="bg-neutral-50 border-neutral-200">
                  <i className="fas fa-search text-neutral-600"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm theo tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-neutral-200"
                />
              </InputGroup>
            </Col>

            <Col md={2}>
              <Form.Select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border-neutral-200"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm nghỉ</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select
                value={programType}
                onChange={(e) => setProgramType(e.target.value)}
                className="border-neutral-200"
              >
                <option value="">Tất cả chương trình</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'ielts' ? 'IELTS' : type === 'toeic' ? 'TOEIC' : type === 'cam' ? 'Cambridge' : type}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="border-neutral-200"
              >
                <option value="">Tất cả cấp độ</option>
                {availableLevels.map(lev => (
                  <option key={lev} value={lev}>{lev}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} className="text-end">
              <div className="btn-group">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                  onClick={() => setViewMode('grid')}
                  className="px-16"
                >
                  <i className="fas fa-th me-2"></i>
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                  onClick={() => setViewMode('list')}
                  className="px-16"
                >
                  <i className="fas fa-list me-2"></i>
                  List
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Grid View */}
      {!loading && !error && viewMode === 'grid' && (
        <Row className="g-3">
          {filteredTeachers.map(teacher => (
            <Col key={teacher._id} lg={4} md={6}>
              <Card className="bg-white border-0 rounded-12 box-shadow-sm h-100">
                <Card.Body className="p-20">
                  <div className="d-flex align-items-start gap-16 mb-16">
                    <div 
                      className="rounded-circle bg-primary-50 d-flex align-items-center justify-content-center"
                      style={{ width: '56px', height: '56px', flexShrink: 0 }}
                    >
                      <i className="fas fa-user-tie text-primary" style={{ fontSize: '24px' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-neutral-900 fw-semibold mb-4">{teacher.username}</h6>
                      <p className="text-neutral-600 text-13 mb-0">{teacher.email}</p>
                    </div>
                  </div>

                  <div className="mb-16">
                    <div className="d-flex align-items-center gap-8 mb-8">
                      <i className="fas fa-door-open text-neutral-400"></i>
                      <span className="text-neutral-700 text-14">
                        Lớp: {teacher.stats?.classCount || 0} lớp
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-8">
                      <i className="fas fa-users text-neutral-400"></i>
                      <span className="text-neutral-700 text-14">
                        Học viên: {teacher.stats?.totalStudents || 0} người
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-8">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewDetail(teacher)}
                      className="flex-grow-1"
                    >
                      <i className="fas fa-eye me-1"></i>
                      Chi tiết
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* List View */}
      {!loading && !error && viewMode === 'list' && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Giảng viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Email</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Số điện thoại</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Lớp học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(teacher => (
                  <tr key={teacher._id}>
                    <td className="px-20 py-16">
                      <div className="d-flex align-items-center gap-12">
                        <div 
                          className="rounded-circle bg-primary-50 d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <i className="fas fa-user-tie text-primary"></i>
                        </div>
                        <div className="text-neutral-900 fw-semibold text-14">{teacher.username}</div>
                      </div>
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-14">{teacher.email}</td>
                    <td className="px-20 py-16 text-neutral-700 text-14">{teacher.phone || 'N/A'}</td>
                    <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                      {teacher.stats?.classCount || 0}
                    </td>
                    <td className="px-20 py-16">
                      <div className="d-flex gap-8">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewDetail(teacher)}
                        >
                          <i className="fas fa-eye me-1"></i>
                          Chi tiết
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
          {/* Pagination */}
          {totalPages > 1 && (
            <Card.Footer className="bg-neutral-25 border-0 px-20 py-16">
              <div className="d-flex justify-content-center">
                <Pagination className="mb-0">
                  <Pagination.First 
                    onClick={() => setPage(1)} 
                    disabled={page === 1}
                  />
                  <Pagination.Prev 
                    onClick={() => setPage(prev => Math.max(1, prev - 1))} 
                    disabled={page === 1}
                  />
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === page}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    } else if (
                      pageNum === page - 2 ||
                      pageNum === page + 2
                    ) {
                      return <Pagination.Ellipsis key={pageNum} />;
                    }
                    return null;
                  })}
                  <Pagination.Next 
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} 
                    disabled={page === totalPages}
                  />
                  <Pagination.Last 
                    onClick={() => setPage(totalPages)} 
                    disabled={page === totalPages}
                  />
                </Pagination>
              </div>
            </Card.Footer>
          )}
        </Card>
      )}

      {/* Add Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm Giảng viên mới</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formErrors.submit && (
              <Alert variant="danger" className="mb-3">
                {formErrors.submit}
              </Alert>
            )}
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tên người dùng <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    required
                    isInvalid={!!formErrors.username}
                  />
                  {formErrors.username && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.username}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    required
                    isInvalid={!!formErrors.email}
                  />
                  {formErrors.email && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.email}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Mật khẩu
                    <span className="text-muted" style={{ fontSize: '12px', fontWeight: 'normal' }}>
                      {' '}(Mặc định: 123456)
                    </span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Để trống sẽ dùng mật khẩu mặc định: 123456"
                    isInvalid={!!formErrors.password}
                  />
                  {formErrors.password && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.password}
                    </Form.Control.Feedback>
                  )}
                  <Form.Text className="text-muted">
                    Nếu không nhập, mật khẩu mặc định sẽ là: <strong>123456</strong>
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                    required
                    isInvalid={!!formErrors.phone}
                  />
                  {formErrors.phone && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.phone}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Địa chỉ liên hệ..."
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Import Excel Modal */}
      <Modal show={showImportModal} onHide={handleCloseImportModal} size="xl">
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
                Lưu ý: Password sẽ tự động được tạo cho mỗi giảng viên (mặc định: 123456)
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
          <Button variant="secondary" onClick={handleCloseImportModal} disabled={loading || importing}>
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmImport}
            disabled={previewTeachers.filter(t => !t.hasError).length === 0 || loading || importing}
          >
            <i className="fas fa-check me-2"></i>
            Xác nhận và Import
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherManagementAPI;
