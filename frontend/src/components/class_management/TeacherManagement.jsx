import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import teacherService from '../../services/teacherService';
import studentService from '../../services/studentService';
import { courseService } from '../../services/courseService';
import * as XLSX from 'xlsx';
import TeacherStats from './TeacherStats';
import TeacherFilters from './TeacherFilters';
import TeacherGridView from './TeacherGridView';
import TeacherListView from './TeacherListView';
import AddTeacherModal from './AddTeacherModal';
import ImportTeacherModal from './ImportTeacherModal';
import TeacherDetail from './TeacherDetail';

const TeacherManagement = () => {
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
  const [selectedStatCard, setSelectedStatCard] = useState('total'); // 'total' or 'inactive'
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

  // Teacher Detail states
  const [showTeacherDetail, setShowTeacherDetail] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

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
  }, [searchTerm, filterStatus, programType, level, selectedStatCard]);

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
        const rowNumber = index + 1; // +2 vì có header và index bắt đầu từ 0
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
        }else {
          // Validate phone length (10-11 digits after normalization)
          const phoneDigits = phone.replace(/\D/g, '');
          if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            errors.push('Số điện thoại phải có 10 hoặc 11 chữ số');
          }
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
      
      previewData.forEach((item, index) => {
        const email = item.email.toLowerCase();
        // Normalize phone before checking duplicates
        const phone = normalizePhone(item.phone);
        
        // Check duplicate email in file
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
        
        // Check duplicate phone in file
        if (phone && phoneMap.has(phone)) {
          const firstIndex = phoneMap.get(phone);
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
        
        const existingEmails = new Set(allUsers.map(u => u.email?.toLowerCase()).filter(Boolean));
        
        const existingPhones = new Set(
          allUsers
            .map(u => normalizePhone(u.phone))
            .filter(Boolean)
        );
        
        previewData.forEach((item) => {
          const email = item.email.toLowerCase();
          const phone = normalizePhone(item.phone);
          
          if (email && existingEmails.has(email)) {
            item.errors.push('Email đã tồn tại trong hệ thống');
            item.hasError = true;
          }
          
          if (phone && existingPhones.has(phone)) {
            item.errors.push('Số điện thoại đã tồn tại trong hệ thống');
            item.hasError = true;
          }
        });
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
    setSelectedTeacherId(teacher._id);
    setShowTeacherDetail(true);
  };

  // If showing teacher detail, render TeacherDetail component
  if (showTeacherDetail && selectedTeacherId) {
    return (
      <TeacherDetail
        teacherId={selectedTeacherId}
        onBack={() => {
          setShowTeacherDetail(false);
          setSelectedTeacherId(null);
        }}
      />
    );
  }

  return (
    <Container fluid className="p-24">
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
      <TeacherStats 
        stats={stats} 
        selectedCard={selectedStatCard}
        onCardClick={setSelectedStatCard}
      />

      {/* Filters */}
      <TeacherFilters
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        programType={programType}
        level={level}
        viewMode={viewMode}
        availableTypes={availableTypes}
        availableLevels={availableLevels}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPage(1);
        }}
        onFilterStatusChange={(value) => {
          setFilterStatus(value);
          setPage(1);
        }}
        onProgramTypeChange={(value) => {
          setProgramType(value);
          setPage(1);
        }}
        onLevelChange={(value) => {
          setLevel(value);
          setPage(1);
        }}
        onViewModeChange={setViewMode}
      />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-neutral-600 mt-16">Đang tải danh sách giảng viên...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="mb-24">
          <Alert.Heading>Lỗi</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Filter teachers based on selected stat card */}
      {(() => {
        let filteredTeachers = teachers;
        if (selectedStatCard === 'inactive') {
          // Only show teachers with no classes
          filteredTeachers = teachers.filter(teacher => 
            !teacher.stats || teacher.stats.classCount === 0
          );
        }
        // If selectedStatCard === 'total', show all teachers (no filter)

        return (
          <>
            {/* Grid View */}
            {!loading && !error && viewMode === 'grid' && (
              <TeacherGridView
                teachers={filteredTeachers}
                onViewDetail={handleViewDetail}
              />
            )}

            {/* List View */}
            {!loading && !error && viewMode === 'list' && (
              <TeacherListView
                teachers={filteredTeachers}
                page={page}
                totalPages={totalPages}
                onViewDetail={handleViewDetail}
                onPageChange={setPage}
              />
            )}
          </>
        );
      })()}

      {/* Add Teacher Modal */}
      <AddTeacherModal
        show={showModal}
        onHide={handleCloseModal}
        formData={formData}
        formErrors={formErrors}
        loading={loading}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
      />

      {/* Import Teacher Modal */}
      <ImportTeacherModal
        show={showImportModal}
        onHide={handleCloseImportModal}
        importFile={importFile}
        previewTeachers={previewTeachers}
        importing={importing}
        loading={loading}
        onFileSelect={handleFileSelect}
        onPreviewExcel={handlePreviewExcel}
        onConfirmImport={handleConfirmImport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </Container>
  );
};

export default TeacherManagement;
