import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Container, Button, Form, Alert, Modal } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import scheduleService from '../../services/scheduleService';
import roomService from '../../services/roomService';
import teacherService from '../../services/teacherService';
import studentService from '../../services/studentService';
import classService from '../../services/classService';
import courseService from '../../services/courseService';
import programService from '../../services/programService';
import SelectStudentModal from './SelectStudentModal';

const createEmptyScheduleEntry = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  day: '',
  startTime: '08:00',
  endTime: '10:00'
});

const CreateClassModal = ({ onClose, onSubmit }) => {
  // Flag để test với mock data - đặt thành true để bypass API
  // NOTE: Chỉ dùng cho testing. Trong production, phải đặt = false để sử dụng API thực tế
  const USE_MOCK_DATA = false; // Đổi thành true để test với mock data
  
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    program: '',
    programId: '', // ID của program được chọn từ dropdown
    band: '',
    course: '',
    teacherId: '',
    roomId: '',
    maxStudents: 25,
    startDate: '',
    endDate: '',
    scheduleEntries: [createEmptyScheduleEntry()],
    selectedStudents: []
  });

  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // Tất cả courses
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null); // Store course details including numberOfSessions

  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(null);
  const [scheduleEntriesError, setScheduleEntriesError] = useState(null);
  const [duplicateEntryIndices, setDuplicateEntryIndices] = useState([]);
  const [showSelectStudentModal, setShowSelectStudentModal] = useState(false);
  const [importingExcel, setImportingExcel] = useState(false);
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [capacityWarning, setCapacityWarning] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  
  // Conflict checking states
  const [conflicts, setConflicts] = useState({
    hasConflict: false,
    teacher: [],
    room: [],
    students: []
  });
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  const [teacherSchedules, setTeacherSchedules] = useState({}); // Map teacherId -> schedules
  const [studentSchedules, setStudentSchedules] = useState({}); // Map studentId -> schedules
  const [existingSchedules, setExistingSchedules] = useState(() => {
    // Mock data để test conflict checking - CHỈ DÙNG KHI USE_MOCK_DATA = true
    // Trong production, dữ liệu sẽ được fetch từ API
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    const twoMonthsLater = new Date(today);
    twoMonthsLater.setMonth(today.getMonth() + 2);
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);

    // Format dates as YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];

    const mockData = [
      // Mock 1: Room 101, Teacher 1, Thứ 2, 08:00-10:00, từ hôm nay đến 1 tháng sau
      // → Sẽ conflict nếu bạn chọn: Room 101, Thứ 2, 08:00-10:00, cùng date range
      {
        id: 'mock-1',
        roomId: 1,
        roomName: 'Room 101',
        teacherId: 1,
        teacherName: 'Nguyễn Văn A',
        day: '2',
        startTime: '08:00',
        endTime: '10:00',
        startDate: formatDate(today),
        endDate: formatDate(nextMonth)
      },
      // Mock 2: Room 102, Teacher 2, Thứ 4, 18:00-20:00, từ 1 tháng sau đến 2 tháng sau
      // → Không conflict với mock-1 (khác ngày, khác date range)
      {
        id: 'mock-2',
        roomId: 2,
        roomName: 'Room 102',
        teacherId: 2,
        teacherName: 'Trần Thị B',
        day: '4',
        startTime: '18:00',
        endTime: '20:00',
        startDate: formatDate(nextMonth),
        endDate: formatDate(twoMonthsLater)
      },
      // Mock 3: Room 101, Teacher 3, Thứ 6, 14:00-16:00, từ hôm nay đến 2 tháng sau
      // → Không conflict với mock-1 (cùng room nhưng khác ngày)
      {
        id: 'mock-3',
        roomId: 1,
        roomName: 'Room 101',
        teacherId: 3,
        teacherName: 'Lê Văn C',
        day: '6',
        startTime: '14:00',
        endTime: '16:00',
        startDate: formatDate(today),
        endDate: formatDate(twoMonthsLater)
      },
      // Mock 4: Room 101, Teacher 2, Thứ 2, 09:00-11:00, từ hôm nay đến 1 tháng sau
      // → CONFLICT với mock-1: cùng room, cùng ngày, overlap thời gian (08:00-10:00 vs 09:00-11:00), overlap date range
      {
        id: 'mock-4',
        roomId: 1,
        roomName: 'Room 101',
        teacherId: 2,
        teacherName: 'Trần Thị B',
        day: '2',
        startTime: '09:00',
        endTime: '11:00',
        startDate: formatDate(today),
        endDate: formatDate(nextMonth)
      },
      // Mock 5: Room 201, Teacher 1, Thứ 2, 08:00-10:00, từ 2 tháng sau đến 3 tháng sau
      // → KHÔNG conflict với mock-1 (cùng teacher, cùng ngày/giờ nhưng khác date range)
      {
        id: 'mock-5',
        roomId: 3,
        roomName: 'Room 201',
        teacherId: 1,
        teacherName: 'Nguyễn Văn A',
        day: '2',
        startTime: '08:00',
        endTime: '10:00',
        startDate: formatDate(twoMonthsLater),
        endDate: formatDate(threeMonthsLater)
      }
    ];
    // Chỉ return mock data nếu USE_MOCK_DATA = true, otherwise return empty array
    // Trong production, dữ liệu sẽ được fetch từ API trong useEffect
    return USE_MOCK_DATA ? mockData : [];
  });
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [dateError, setDateError] = useState('');
  const [mappings, setMappings] = useState([]); // Store all mappings from database
  const [availablePrograms, setAvailablePrograms] = useState(['IELTS', 'TOEIC', 'Cambridge']); // All program types (static list)
  const [availableLevels, setAvailableLevels] = useState([]); // Levels filtered by selected program type
  const [allProgramsFromDB, setAllProgramsFromDB] = useState([]); // All programs from Program table
  const [filteredProgramsFromDB, setFilteredProgramsFromDB] = useState([]); // Programs filtered by type and level

  // Program name to type mapping
  const programTypeMap = {
    'IELTS': 'ielts',
    'TOEIC': 'toeic',
    'Cambridge': 'cam'
  };

  // Type to program name mapping
  const typeProgramMap = {
    'ielts': 'IELTS',
    'toeic': 'TOEIC',
    'cam': 'Cambridge'
  };

  const daysOfWeek = [
    { value: '2', label: 'Thứ 2' },
    { value: '3', label: 'Thứ 3' },
    { value: '4', label: 'Thứ 4' },
    { value: '5', label: 'Thứ 5' },
    { value: '6', label: 'Thứ 6' },
    { value: '7', label: 'Thứ 7' },
    { value: 'CN', label: 'Chủ nhật' }
  ];

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Map program name to type
  const getTypeFromProgram = (programName) => {
    return programTypeMap[programName] || null;
  };

  // Map type to program name (case-insensitive)
  const getProgramFromType = (type) => {
    if (!type) return null;
    const normalizedType = type.toLowerCase();
    return typeProgramMap[normalizedType] || null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Auto-update maxStudents when room is selected/deselected
    if (name === 'roomId') {
      if (value) {
        // Find selected room and set maxStudents to room capacity
        const selectedRoom = rooms.find(r => {
          const roomId = r._id || r.id;
          return String(roomId) === String(value);
        });
        if (selectedRoom) {
          const capacity = selectedRoom.capacity || selectedRoom.maxCapacity || selectedRoom.maxStudents;
          setFormData(prev => ({ ...prev, roomId: value, maxStudents: capacity }));
          return; // Don't process further
        }
      } else {
        // Room deselected, clear maxStudents
        setFormData(prev => ({ ...prev, roomId: '', maxStudents: null }));
        return; // Don't process further
      }
    }

    // Validate start date when it changes
    if (name === 'startDate') {
      const today = getTodayDate();

      // Validate start date is not in the past
      if (value && value < today) {
        setDateError('Ngày khai giảng không được là quá khứ!');
      } else {
        setDateError('');
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentToggle = (studentId) => {
    setFormData(prev => {
      const currentSelected = prev.selectedStudents || [];
      const isSelected = currentSelected.includes(studentId);
      
      if (isSelected) {
        // Remove student
        return {
          ...prev,
          selectedStudents: currentSelected.filter(id => id !== studentId)
        };
      } else {
        // Add student
        return {
          ...prev,
          selectedStudents: [...currentSelected, studentId]
        };
      }
    });
  };

  const handleRemoveStudent = (studentId) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.filter(id => id !== studentId)
    }));
  };

  const handleStudentsConfirmed = (selectedStudentIds) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: selectedStudentIds
    }));
  };

  // Normalize phone number for matching (remove spaces, +, -, etc.)
  const normalizePhone = (phone) => {
    if (!phone) return '';
    return phone.toString().replace(/[\s\+\-\(\)]/g, '');
  };

  // Handle Excel import button click
  const handleExcelImport = () => {
    fileInputRef.current?.click();
  };

  // Handle Excel file selection and processing
  const handleExcelFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate course selection first
    if (!formData.course) {
      setImportResult({
        success: 0,
        notFound: [],
        total: 0,
        error: 'Vui lòng chọn course trước khi import học viên từ Excel'
      });
      setShowImportResultModal(true);
      e.target.value = '';
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const isValidType = validTypes.includes(file.type) || 
                       file.name.endsWith('.xlsx') || 
                       file.name.endsWith('.xls');

    if (!isValidType) {
      setImportResult({
        success: 0,
        notFound: [],
        total: 0,
        error: 'Vui lòng chọn file Excel (.xlsx hoặc .xls)'
      });
      setShowImportResultModal(true);
      e.target.value = '';
      return;
    }

    setImportingExcel(true);

    try {
      // Read file as array buffer
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Get first sheet
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        setImportResult({
          success: 0,
          notFound: [],
          total: 0,
          error: 'File Excel không có sheet nào'
        });
        setShowImportResultModal(true);
        e.target.value = '';
        return;
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        setImportResult({
          success: 0,
          notFound: [],
          total: 0,
          error: 'Sheet đầu tiên không có dữ liệu'
        });
        setShowImportResultModal(true);
        e.target.value = '';
        return;
      }

      // Convert to JSON (array of objects)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        defval: '' 
      });

      if (!jsonData || jsonData.length === 0) {
        setImportResult({
          success: 0,
          notFound: [],
          total: 0,
          error: 'File Excel không có dữ liệu'
        });
        setShowImportResultModal(true);
        e.target.value = '';
        return;
      }

      // Extract emails from first column (skip header row)
      const emails = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row[0]) {
          const value = String(row[0]).trim();
          if (value) {
            // Validate if it's an email format
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              emails.push(value);
            } else {
              // If not a valid email, skip it and add to notFound
              // We'll handle this in the error message
            }
          }
        }
      }

      if (emails.length === 0) {
        setImportResult({
          success: 0,
          notFound: [],
          total: 0,
          error: 'Không tìm thấy email hợp lệ nào trong file Excel. Vui lòng đảm bảo cột đầu tiên chứa email của học viên.'
        });
        setShowImportResultModal(true);
        e.target.value = '';
        return;
      }

      // Get studentEnrollments from selectedCourse
      let enrolledStudentIds = [];
      if (selectedCourse && selectedCourse.studentEnrollments) {
        enrolledStudentIds = selectedCourse.studentEnrollments.map(id => String(id));
      } else {
        // Fetch course details if not available
        try {
          const response = await courseService.getCourseDetails(formData.course);
          if (response && response.success && response.data) {
            const course = response.data;
            enrolledStudentIds = (course.studentEnrollments || []).map(id => String(id));
          }
        } catch (error) {
          console.error('Error fetching course details:', error);
          // Continue with empty array - will check enrollment later
        }
      }

      // Match students by email only
      const matchedStudentIds = [];
      const notFound = [];

      emails.forEach((email) => {
        const normalizedEmail = email.toLowerCase().trim();

        const foundStudent = students.find((student) => {
          const studentEmail = (student.email || '').toLowerCase().trim();
          return studentEmail === normalizedEmail;
        });

        if (foundStudent) {
          const studentId = foundStudent._id || foundStudent.id;
          const studentIdStr = String(studentId);
          
          // Check if student is enrolled in the selected course
          if (studentId && enrolledStudentIds.includes(studentIdStr)) {
            // Student found and enrolled in course
            if (!matchedStudentIds.includes(studentIdStr)) {
              matchedStudentIds.push(studentIdStr);
            }
          } else {
            // Student found but not enrolled in course
            notFound.push(`${email} (chưa enroll vào course này)`);
          }
        } else {
          // Student not found in database
          notFound.push(email);
        }
      });

      // Add matched students to selectedStudents (avoid duplicates)
      if (matchedStudentIds.length > 0) {
        setFormData(prev => {
          const currentSelected = prev.selectedStudents || [];
          const newSelected = [...new Set([...currentSelected, ...matchedStudentIds])];
          return {
            ...prev,
            selectedStudents: newSelected
          };
        });
      }

      // Show results in modal
      setImportResult({
        success: matchedStudentIds.length,
        notFound: notFound,
        total: emails.length
      });
      setShowImportResultModal(true);

    } catch (error) {
      setImportResult({
        success: 0,
        notFound: [],
        total: 0,
        error: 'Lỗi khi đọc file Excel: ' + (error.message || 'Vui lòng thử lại')
      });
      setShowImportResultModal(true);
    } finally {
      setImportingExcel(false);
      e.target.value = ''; // Reset file input
    }
  };

  // Handle download Excel template
  const handleDownloadTemplate = () => {
    // Create sample data - only first column with Email
    const sampleData = [
      ['Email'], // Header row
      ['student1@email.com'], // Example email
      ['student2@email.com'], // Another example email
      ['student3@email.com'] // Another example email
    ];

    // Create worksheet from array
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học viên');

    // Generate file name
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `Mau_Import_Hoc_Vien_Lop_Hoc_${timestamp}.xlsx`;

    // Write and download
    XLSX.writeFile(wb, fileName);
  };

  // Auto-fetch band when program and level are selected
  useEffect(() => {
    const fetchBand = async () => {
      if (!formData.program || !formData.level) {
        // Clear band if program or level is empty
        setFormData(prev => ({ ...prev, band: '' }));
        return;
      }

      const type = getTypeFromProgram(formData.program);
      
      if (!type) {
        return;
      }

      try {
        const response = await courseService.getBandByTypeAndLevel(type, formData.level);

        if (response && response.success) {
          if (response.band && response.band.trim() !== '') {
            setFormData(prev => ({ ...prev, band: response.band }));
          } else {
            setFormData(prev => ({ ...prev, band: '' }));
          }
        } else {
          setFormData(prev => ({ ...prev, band: '' }));
        }
      } catch (error) {
        // Clear band on error to avoid showing stale data
        setFormData(prev => ({ ...prev, band: '' }));
      }
    };

    fetchBand();
  }, [formData.program, formData.level]);

  // Fetch all courses on mount
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await courseService.getAllCourses();

        if (response && response.success && response.data) {
          // Filter to only show courses with status 'completed' or 'active'
          const validCourses = response.data.filter(course => 
            course.status === 'completed' || course.status === 'active'
          );
          setAllCourses(validCourses);
          setCourses(validCourses); // Initially show only completed/active courses
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchAllCourses();
  }, []);


  // Fetch course details when course is selected
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!formData.course) {
        setSelectedCourse(null);
        return;
      }

      // First, try to get course from the courses list (already fetched)
      const courseFromList = courses.find(c => (c._id || c.id) === formData.course);
      if (courseFromList && courseFromList.numberOfSessions) {
        // Use course from list if it has numberOfSessions
        setSelectedCourse(courseFromList);
        return;
      }

      // If not found in list or missing numberOfSessions, fetch details
      try {
        const response = await courseService.getCourseDetails(formData.course);
        if (response && response.success && response.data) {
          setSelectedCourse(response.data);
        } else {
          // Fallback to course from list if available
          if (courseFromList) {
            setSelectedCourse(courseFromList);
          }
        }
      } catch (error) {
        // Fallback to course from list if available
        if (courseFromList) {
          setSelectedCourse(courseFromList);
        } else {
          setSelectedCourse(null);
        }
      }
    };

    fetchCourseDetails();
  }, [formData.course, courses]);

  // Populate band when course is selected (only if band not already set from program)
  useEffect(() => {
    if (!selectedCourse) {
      // Don't clear band if we already have it from program selection
      return;
    }

    // Get program info from selected course to find band
    let courseProgram = selectedCourse.program;
    if (!courseProgram) {
      return;
    }

    // Get band directly from program object
    let programBand;
    if (typeof courseProgram === 'object' && courseProgram._id) {
      programBand = courseProgram.band;
    } else if (typeof courseProgram === 'string') {
      const programObj = allProgramsFromDB.find(p => String(p._id) === String(courseProgram));
      if (programObj) {
        programBand = programObj.band;
      }
    }

    if (programBand) {
      setFormData(prev => ({ ...prev, band: programBand }));
    }
  }, [formData.course, selectedCourse, allProgramsFromDB]);

  // Real-time capacity validation
  useEffect(() => {
    if (formData.roomId && formData.selectedStudents && formData.selectedStudents.length > 0) {
      const selectedRoom = rooms.find(r => (r._id || r.id) === formData.roomId);
      if (selectedRoom) {
        const roomCapacity = selectedRoom.capacity || selectedRoom.maxCapacity || selectedRoom.maxStudents;
        const studentCount = formData.selectedStudents.length;
        
        if (roomCapacity && studentCount > roomCapacity) {
          setCapacityWarning({
            type: 'danger',
            message: ` Cảnh báo: Số học viên (${studentCount}) vượt quá sức chứa của phòng (${roomCapacity} học viên). Vui lòng chọn phòng lớn hơn hoặc giảm số học viên.`
          });
        } else {
          setCapacityWarning(null);
        }
      } else {
        setCapacityWarning(null);
      }
    } else {
      setCapacityWarning(null);
    }
  }, [formData.roomId, formData.selectedStudents, rooms]);

  const checkDuplicateEntries = (entries) => {
    const seen = new Set();
    const duplicates = [];
    
    entries.forEach((entry, index) => {
      // Chỉ kiểm tra entries đã điền đầy đủ
      if (!entry.day || !entry.startTime || !entry.endTime) {
        return;
      }
      
      const key = `${entry.day}-${entry.startTime}-${entry.endTime}`;
      if (seen.has(key)) {
        duplicates.push(index);
      } else {
        seen.add(key);
      }
    });
    
    return duplicates;
  };

  const handleScheduleEntryChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      scheduleEntries: prev.scheduleEntries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    }));
  };

  // Real-time validation: Check for duplicates whenever scheduleEntries change
  useEffect(() => {
    const duplicates = checkDuplicateEntries(formData.scheduleEntries);
    if (duplicates.length > 0) {
      setScheduleEntriesError('Có các buổi học trùng lặp. Vui lòng kiểm tra lại ngày và giờ học.');
      setDuplicateEntryIndices(duplicates);
    } else {
      setScheduleEntriesError(null);
      setDuplicateEntryIndices([]);
    }
  }, [formData.scheduleEntries]);

  // Real-time conflict checking: Only check for student conflicts
  // Teacher and room conflicts are already filtered in dropdowns
  useEffect(() => {
    const checkConflicts = async () => {
      // Only check if we have selected students and minimum required fields
      if (!formData.selectedStudents || formData.selectedStudents.length === 0 ||
          !formData.startDate || !formData.course ||
          !formData.scheduleEntries || formData.scheduleEntries.length === 0 ||
          formData.scheduleEntries.some(entry => !entry.day || !entry.startTime || !entry.endTime)) {
        setConflicts({
          hasConflict: false,
          teacher: [],
          room: [],
          students: []
        });
        return;
      }

      setCheckingConflicts(true);
      try {
        const conflictData = {
          course: formData.course,
          students: formData.selectedStudents || [],
          startDate: formData.startDate,
          scheduleEntries: formData.scheduleEntries.map(entry => ({
            day: entry.day,
            startTime: entry.startTime,
            endTime: entry.endTime
          }))
        };

        const response = await classService.validateConflicts(conflictData);

        if (response.success) {
          // Only show student conflicts (teacher/room already filtered in dropdowns)
          setConflicts({
            hasConflict: response.conflicts?.students?.length > 0,
            teacher: [],
            room: [],
            students: response.conflicts?.students || []
          });
        }
      } catch (error) {
        // Don't show error to user, just silently fail
        setConflicts({
          hasConflict: false,
          teacher: [],
          room: [],
          students: []
        });
      } finally {
        setCheckingConflicts(false);
      }
    };

    // Debounce the conflict check to avoid too many API calls
    const timeoutId = setTimeout(() => {
      checkConflicts();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData.startDate, formData.course, formData.selectedStudents, formData.scheduleEntries]);

  const addScheduleEntry = () => {
    setFormData(prev => ({
      ...prev,
      scheduleEntries: [...prev.scheduleEntries, createEmptyScheduleEntry()]
    }));
  };

  const removeScheduleEntry = (id) => {
    setFormData(prev => ({
      ...prev,
      scheduleEntries:
        prev.scheduleEntries.length > 1
          ? prev.scheduleEntries.filter(entry => entry.id !== id)
          : prev.scheduleEntries
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.level || !formData.program) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin bắt buộc (tên lớp, chương trình, cấp độ)!');
      setShowErrorModal(true);
      return;
    }

    if (
      formData.scheduleEntries.length === 0 ||
      formData.scheduleEntries.some(entry => !entry.day)
    ) {
      setErrorMessage('Vui lòng chọn ít nhất 1 ngày học và điền đủ thời gian!');
      setShowErrorModal(true);
      return;
    }

    if (
      formData.scheduleEntries.some(
        entry => entry.startTime >= entry.endTime
      )
    ) {
      setErrorMessage('Giờ bắt đầu phải nhỏ hơn giờ kết thúc!');
      setShowErrorModal(true);
      return;
    }

    // Check for duplicate schedule entries
    const duplicateIndices = checkDuplicateEntries(formData.scheduleEntries);
    if (duplicateIndices.length > 0) {
      setScheduleEntriesError('Có các buổi học trùng lặp. Vui lòng kiểm tra lại ngày và giờ học.');
      setErrorMessage('Có các buổi học trùng lặp. Vui lòng kiểm tra lại ngày và giờ học.');
      setShowErrorModal(true);
      return;
    }
    setScheduleEntriesError(null);

    // Validate start date is not in the past
    const today = getTodayDate();
    if (formData.startDate && formData.startDate < today) {
      setDateError('Ngày khai giảng không được là quá khứ!');
      setErrorMessage('Ngày khai giảng không được là quá khứ!');
      setShowErrorModal(true);
      return;
    }

    // Validate course is selected
    if (!formData.course) {
      setErrorMessage('Vui lòng chọn course!');
      setShowErrorModal(true);
      return;
    }

    // Validate room capacity if room is selected
    if (formData.roomId) {
      const selectedRoom = rooms.find(r => (r._id || r.id) === formData.roomId);
      if (selectedRoom) {
        const roomCapacity = selectedRoom.capacity || selectedRoom.maxCapacity || selectedRoom.maxStudents;
        const studentCount = (formData.selectedStudents || []).length;
        
        if (roomCapacity && studentCount > roomCapacity) {
          setErrorMessage(`Số học viên (${studentCount}) vượt quá sức chứa của phòng (${roomCapacity} học viên). Vui lòng chọn phòng lớn hơn hoặc giảm số học viên.`);
          setShowErrorModal(true);
          return;
        }
      }
    }

    // Transform formData to match backend API expectations
    const submitData = {
      ...formData,
      students: formData.selectedStudents || [], // Map selectedStudents to students for backend
    };

    // Only add teacher, room, teacherId if they have valid values
    if (formData.teacherId && formData.teacherId !== '') {
      submitData.teacher = formData.teacherId;
      submitData.teacherId = formData.teacherId;
    }

    if (formData.roomId && formData.roomId !== '') {
      submitData.room = formData.roomId;
    }

    // Remove fields that shouldn't be sent to backend
    delete submitData.selectedStudents;
    if (!submitData.teacher) {
      delete submitData.teacher;
    }
    if (!submitData.teacherId) {
      delete submitData.teacherId;
    }
    if (!submitData.room) {
      delete submitData.roomId;
      delete submitData.room;
    } else {
      delete submitData.roomId;
    }

    onSubmit(submitData);
  };

  // Fetch types and levels from program table on mount
  // Fetch all programs from DB on mount (for filtering later)
  useEffect(() => {
    const fetchAllPrograms = async () => {
      try {
        const programsResponse = await programService.getAllPrograms();
        if (programsResponse?.success && programsResponse.data) {
          const approvedPrograms = programsResponse.data.filter(p => p.status === 'approved' && p.isActive === true);
          setAllProgramsFromDB(approvedPrograms);
        }

        // Also fetch mappings for band lookup
        try {
          const mappingsResponse = await courseService.getCourseMappings();
          if (mappingsResponse && mappingsResponse.success && mappingsResponse.mappings) {
            setMappings(mappingsResponse.mappings);
          }
        } catch (mappingsError) {
          // Error fetching mappings
        }
      } catch (error) {
        // Error fetching programs
      }
    };
    fetchAllPrograms();
  }, []);

  // CASCADE 1: When program type changes → fetch levels and reset downstream fields
  useEffect(() => {
    const fetchLevels = async () => {
      // Reset downstream fields
      setFormData(prev => ({
        ...prev,
        level: '',
        programId: '',
        course: '',
        band: ''
      }));
      setAvailableLevels([]);
      setFilteredProgramsFromDB([]);

      if (!formData.program || formData.program === '') {
        return;
      }

      const type = getTypeFromProgram(formData.program);
      if (!type) {
        return;
      }

      // Fetch levels for this program type
      try {
        const response = await courseService.getLevelsByType(type);
        if (response?.success && response.levels) {
          setAvailableLevels(response.levels);
        }
      } catch (error) {
        console.error('Error fetching levels by type:', error);
      }
    };

    fetchLevels();
  }, [formData.program]);

  // CASCADE 2: When level changes → filter programs (from allProgramsFromDB) and reset downstream fields
  useEffect(() => {
    const filterPrograms = () => {
      // Reset downstream fields
      setFormData(prev => ({
        ...prev,
        programId: '',
        course: '',
        band: ''
      }));
      setFilteredProgramsFromDB([]);

      if (!formData.program || !formData.level || !allProgramsFromDB.length) {
        return;
      }

      const type = getTypeFromProgram(formData.program);
      if (!type) {
        return;
      }

      // Filter programs by type and level
      const filtered = allProgramsFromDB.filter(prog =>
        prog.type === type && prog.level === formData.level
      );
      setFilteredProgramsFromDB(filtered);
    };

    filterPrograms();
  }, [formData.level, formData.program, allProgramsFromDB]);

  // CASCADE 3: When programId changes → fetch courses, populate band, and reset course
  useEffect(() => {
    const fetchCoursesAndBand = async () => {
      console.log('=== CASCADE 3: programId changed ===');
      console.log('formData.programId:', formData.programId);

      // Reset course (but not band yet, will populate below)
      setFormData(prev => ({
        ...prev,
        course: ''
      }));

      if (!formData.programId) {
        console.log('No programId, clearing band');
        setFormData(prev => ({ ...prev, band: '' }));
        return;
      }

      // Find selected program to get type and level
      const selectedProgram = allProgramsFromDB.find(p => String(p._id) === String(formData.programId));
      console.log('Selected program:', selectedProgram);

      if (!selectedProgram) {
        console.log('Program not found in allProgramsFromDB');
        setFormData(prev => ({ ...prev, band: '' }));
        return;
      }

      console.log('Program type:', selectedProgram.type);
      console.log('Program level:', selectedProgram.level);
      console.log('Program band:', selectedProgram.band);

      // Get band directly from selected program (no need to fetch)
      if (selectedProgram.band) {
        console.log('Setting band to:', selectedProgram.band);
        setFormData(prev => ({ ...prev, band: selectedProgram.band }));
      } else {
        console.log('No band in program, clearing');
        setFormData(prev => ({ ...prev, band: '' }));
      }

      // Fetch courses for this program
      try {
        const response = await courseService.getCoursesByProgramId(formData.programId);
        if (response?.success && response.courses) {
          const activeCourses = response.courses.filter(course => course.isActive === true);
          setCourses(activeCourses);
        }
      } catch (error) {
        console.error('Error fetching courses by program:', error);
      }
    };

    fetchCoursesAndBand();
  }, [formData.programId, allProgramsFromDB]);


  useEffect(() => {
    const fetchExistingSchedules = async () => {
      // Nếu USE_MOCK_DATA = true, bỏ qua API và giữ nguyên mock data
      if (USE_MOCK_DATA) {
        setRoomLoading(false);
        return;
      }

      try {
        setRoomLoading(true);
        setRoomError(null);
        const response = await scheduleService.getAllSchedules();
        
        if (response) {
          const fetched =
            Array.isArray(response.schedules) && response.schedules.length > 0
              ? response.schedules
              : Array.isArray(response.data) && response.data.length > 0
                ? response.data
                : null;
          
          if (fetched) {
            setExistingSchedules(fetched);
          }
        }
      } catch (error) {
      } finally {
        setRoomLoading(false);
      }
    };

    fetchExistingSchedules();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getAllRooms();

        if (response && (response.rooms || response.data)) {
          const fetchedRooms = response.rooms || response.data || [];
          // Only show rooms with status 'available'
          const availableRooms = fetchedRooms.filter(room => room.status === 'available');
          setRooms(availableRooms);
        }
      } catch (error) {
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await teacherService.getAllTeachers();
        
        if (response && (response.teachers || response.data)) {
          const fetchedTeachers = response.teachers || response.data || [];
          setTeachers(fetchedTeachers);
        } else {
          setTeachers([]);
        }
      } catch (error) {
        setTeachers([]);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setStudentsLoading(true);
        setStudentsError(null);
        const response = await studentService.getAllStudents();
        
        if (response && (response.students || response.data)) {
          const fetchedStudents = response.students || response.data || [];
          setStudents(fetchedStudents);
        } else {
          setStudents([]);
          setStudentsError('Không tìm thấy dữ liệu học viên');
        }
      } catch (error) {
        setStudents([]);
        const errorMessage = error.message || 'Không thể tải danh sách học viên';
        setStudentsError(errorMessage);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (USE_MOCK_DATA && teachers.length > 0) {
      const teacherNameToIdMap = {};
      teachers.forEach(teacher => {
        const teacherName = teacher.name || teacher.teacherName || teacher.fullName;
        const teacherId = teacher._id || teacher.id;
        if (teacherName && teacherId) {
          teacherNameToIdMap[teacherName] = teacherId;
        }
      });

      setExistingSchedules(prevSchedules => {
        const updatedSchedules = prevSchedules.map(schedule => {
          if (schedule.teacherName && teacherNameToIdMap[schedule.teacherName]) {
            return {
              ...schedule,
              teacherId: teacherNameToIdMap[schedule.teacherName]
            };
          }
          return schedule;
        });
        return updatedSchedules;
      });
    }
  }, [teachers, USE_MOCK_DATA]);

  const parseDateToDayOfWeek = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;

      const dayOfWeek = date.getDay();
      const dayMap = { 0: 'CN', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7' };
      return dayMap[dayOfWeek] || null;
    } catch (error) {
      return null;
    }
  };

  const normalizeDayValue = (value) => {
    if (!value) return null;
    
    if (typeof value === 'string' && (value.includes('-') || value.includes('/'))) {
      const dayFromDate = parseDateToDayOfWeek(value);
      if (dayFromDate) {
        return dayFromDate;
      }
    }
    
    if (typeof value === 'number') {
      return value.toString();
    }
    
    const normalized = 
      ['T2', 'Thứ 2', 'Monday', 'Mon'].includes(value) ? '2' :
      ['T3', 'Thứ 3', 'Tuesday', 'Tue'].includes(value) ? '3' :
      ['T4', 'Thứ 4', 'Wednesday', 'Wed'].includes(value) ? '4' :
      ['T5', 'Thứ 5', 'Thursday', 'Thu'].includes(value) ? '5' :
      ['T6', 'Thứ 6', 'Friday', 'Fri'].includes(value) ? '6' :
      ['T7', 'Thứ 7', 'Saturday', 'Sat'].includes(value) ? '7' :
      ['CN', 'Chủ nhật', 'Sunday', 'Sun'].includes(value) ? 'CN' :
      value.toString();
    return normalized;
  };

  const parseTime = (time) => {
    if (!time) return null;
    return time.length === 5 ? time : time.slice(0, 5);
  };

  const hasTimeOverlap = (startA, endA, startB, endB) => {
    if (!startA || !endA || !startB || !endB) return false;
    
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const parts = timeStr.split(':');
      if (parts.length !== 2) return 0;
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      return hours * 60 + minutes;
    };
    
    const startAMin = timeToMinutes(startA);
    const endAMin = timeToMinutes(endA);
    const startBMin = timeToMinutes(startB);
    const endBMin = timeToMinutes(endB);
    
    return startAMin < endBMin && endAMin > startBMin;
  };

  const hasDateRangeOverlap = (startDateA, endDateA, startDateB, endDateB) => {
    if (!startDateA || !endDateA || !startDateB || !endDateB) return true;
    
    const startA = new Date(startDateA);
    const endA = new Date(endDateA);
    const startB = new Date(startDateB);
    const endB = new Date(endDateB);
    
    return startA <= endB && startB <= endA;
  };

  const getDayOfWeekNumber = (dayStr) => {
    const dayMap = {
      'CN': 0,
      '2': 1,
      '3': 2,
      '4': 3,
      '5': 4,
      '6': 5,
      '7': 6
    };
    return dayMap[dayStr] !== undefined ? dayMap[dayStr] : null;
  };

  const findNextDayOfWeek = (startDate, targetDayOfWeek) => {
    const start = new Date(startDate);
    const currentDay = start.getDay();
    let daysToAdd = (targetDayOfWeek - currentDay + 7) % 7;
    if (daysToAdd === 0 && start.getTime() < new Date().getTime()) {
      daysToAdd = 7;
    }
    const result = new Date(start);
    result.setDate(start.getDate() + daysToAdd);
    return result;
  };

  const generateSessions = (startDate, scheduleEntries, numberOfSessions) => {
    if (!startDate || !scheduleEntries.length || !numberOfSessions) {
      return [];
    }

    const sessions = [];
    const start = new Date(startDate);
    
    const firstOccurrences = {};
    scheduleEntries.forEach(entry => {
      const dayOfWeek = getDayOfWeekNumber(entry.day);
      if (dayOfWeek !== null && !firstOccurrences[dayOfWeek]) {
        firstOccurrences[dayOfWeek] = findNextDayOfWeek(start, dayOfWeek);
      }
    });

    let entryIndex = 0;
    let weekOffset = 0;

    for (let i = 0; i < numberOfSessions; i++) {
      const entry = scheduleEntries[entryIndex % scheduleEntries.length];
      const dayOfWeek = getDayOfWeekNumber(entry.day);
      
      if (dayOfWeek === null) {
        entryIndex++;
        continue;
      }

      const firstOccurrence = firstOccurrences[dayOfWeek];
      
      const sessionDate = new Date(firstOccurrence);
      sessionDate.setDate(firstOccurrence.getDate() + (weekOffset * 7));

      sessions.push({
        date: sessionDate.toISOString().split('T')[0],
        dayOfWeek: dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime
      });

      entryIndex++;
      if (entryIndex % scheduleEntries.length === 0) {
        weekOffset++;
      }
    }

    return sessions;
  };

  const filledScheduleEntries = useMemo(
    () =>
      formData.scheduleEntries.filter(
        (entry) => entry.day && entry.startTime && entry.endTime
      ),
    [formData.scheduleEntries]
  );

  const generatedSessions = useMemo(() => {
    if (!formData.startDate || !filledScheduleEntries.length || !selectedCourse?.numberOfSessions) {
      return [];
    }
    return generateSessions(formData.startDate, filledScheduleEntries, selectedCourse.numberOfSessions);
  }, [formData.startDate, filledScheduleEntries, selectedCourse?.numberOfSessions]);

  const conflictingRoomIds = useMemo(() => {
    if (!generatedSessions.length || !existingSchedules.length) {
      return new Set();
    }

    const conflicts = new Set();

    generatedSessions.forEach((session) => {
      const sessionDate = session.date;
      const sessionStart = parseTime(session.startTime);
      const sessionEnd = parseTime(session.endTime);

      existingSchedules.forEach((schedule) => {
        const scheduleRoomId =
          schedule.room?._id?.toString() ||
          schedule.roomId ||
          schedule.roomID ||
          schedule.room?.id ||
          schedule.room?.id?.toString();
        const scheduleRoomName = 
          schedule.room?.room_name ||
          schedule.roomName || 
          schedule.room?.name;

        if (!scheduleRoomId && !scheduleRoomName) {
          return;
        }

        const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
        if (!scheduleDate) {
          return;
        }

        // Validate date before creating Date object
        const dateObj = new Date(scheduleDate);
        if (isNaN(dateObj.getTime())) {
          return; // Invalid date, skip this schedule
        }

        const scheduleDateStr = dateObj.toISOString().split('T')[0];

        if (scheduleDateStr !== sessionDate) {
          return;
        }

        const scheduleStart = parseTime(
          schedule.startTime ||
            schedule.start_time ||
            schedule.time?.start ||
            schedule.startHour
        );

        const scheduleEnd = parseTime(
          schedule.endTime ||
            schedule.end_time ||
            schedule.time?.end ||
            schedule.endHour
        );

        const hasTimeConflict = hasTimeOverlap(sessionStart, sessionEnd, scheduleStart, scheduleEnd);

        if (hasTimeConflict) {
          if (scheduleRoomId) {
            conflicts.add(String(scheduleRoomId));
          }
          if (scheduleRoomName) {
            conflicts.add(scheduleRoomName);
          }
        }
      });
    });

    return conflicts;
  }, [generatedSessions, existingSchedules]);

  useEffect(() => {
    const fetchTeacherSchedules = async () => {
      if (!teachers.length || !generatedSessions.length) {
        return;
      }

      const schedulesMap = {};
      
      if (generatedSessions.length === 0) return;
      
      const sessionDates = generatedSessions.map(s => s.date).sort();
      const minDate = sessionDates[0];
      const maxDate = sessionDates[sessionDates.length - 1];

      await Promise.all(
        teachers.map(async (teacher) => {
          const teacherId = teacher._id || teacher.id;
          if (!teacherId) return;

          try {
            const response = await teacherService.getTeacherSchedule(teacherId, {
              startDate: minDate,
              endDate: maxDate
            });

            if (response && response.schedules) {
              schedulesMap[String(teacherId)] = response.schedules;
            }
          } catch (error) {
            schedulesMap[String(teacherId)] = [];
          }
        })
      );

      setTeacherSchedules(schedulesMap);
    };

    fetchTeacherSchedules();
  }, [teachers, generatedSessions]);

  useEffect(() => {
    const fetchStudentSchedules = async () => {
      if (!formData.selectedStudents.length || !generatedSessions.length) {
        setStudentSchedules({});
        return;
      }

      const schedulesMap = {};
      
      const sessionDates = generatedSessions.map(s => s.date).sort();
      const minDate = sessionDates[0];
      const maxDate = sessionDates[sessionDates.length - 1];
      
      await Promise.all(
        formData.selectedStudents.map(async (studentId) => {
          if (!studentId) return;

          try {
            const response = await studentService.getStudentSchedule(studentId, {
              startDate: minDate,
              endDate: maxDate
            });
            
            if (response && response.schedules) {
              schedulesMap[String(studentId)] = response.schedules;
            } else if (response && response.data) {
              schedulesMap[String(studentId)] = response.data;
            } else {
              schedulesMap[String(studentId)] = [];
            }
          } catch (error) {
            schedulesMap[String(studentId)] = [];
          }
        })
      );

      setStudentSchedules(schedulesMap);
    };

    fetchStudentSchedules();
  }, [formData.selectedStudents, generatedSessions]);

  const conflictingTeacherIds = useMemo(() => {
    if (!generatedSessions.length || Object.keys(teacherSchedules).length === 0) {
      return new Set();
    }

    const conflicts = new Set();

    Object.entries(teacherSchedules).forEach(([teacherId, schedules]) => {
      if (!schedules || schedules.length === 0) return;

      generatedSessions.forEach((session) => {
        const sessionDate = session.date;
        const sessionStart = parseTime(session.startTime);
        const sessionEnd = parseTime(session.endTime);

        schedules.forEach((schedule) => {
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
          if (!scheduleDate) return;

          // Parse date - handle both ISO format and DD/MM/YYYY format
          let dateObj;
          if (scheduleDate.includes('/')) {
            // DD/MM/YYYY format
            const [day, month, year] = scheduleDate.split('/');
            dateObj = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
          } else {
            // ISO format or other
            dateObj = new Date(scheduleDate);
          }

          if (isNaN(dateObj.getTime())) {
            return; // Invalid date, skip this schedule
          }

          const scheduleDateStr = dateObj.toISOString().split('T')[0];

          if (scheduleDateStr !== sessionDate) {
            return;
          }

          const scheduleStart = parseTime(schedule.startTime);
          const scheduleEnd = parseTime(schedule.endTime);
          const hasTimeConflict = hasTimeOverlap(sessionStart, sessionEnd, scheduleStart, scheduleEnd);

          if (hasTimeConflict) {
            conflicts.add(teacherId);
          }
        });
      });
    });

    return conflicts;
  }, [generatedSessions, teacherSchedules]);

  const conflictingStudentIds = useMemo(() => {
    if (!generatedSessions.length || Object.keys(studentSchedules).length === 0) {
      return new Map();
    }

    const conflicts = new Map();

    Object.entries(studentSchedules).forEach(([studentId, schedules]) => {
      if (!schedules || schedules.length === 0) return;

      const studentConflicts = [];

      generatedSessions.forEach((session) => {
        const sessionDate = session.date;
        const sessionStart = parseTime(session.startTime);
        const sessionEnd = parseTime(session.endTime);

        schedules.forEach((schedule) => {
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate || schedule.classSchedule?.date;
          if (!scheduleDate) return;

          // Validate date before creating Date object
          const dateObj = new Date(scheduleDate);
          if (isNaN(dateObj.getTime())) {
            return; // Invalid date, skip this schedule
          }

          const scheduleDateStr = dateObj.toISOString().split('T')[0];

          if (scheduleDateStr !== sessionDate) {
            return;
          }

          const scheduleStart = parseTime(
            schedule.startTime ||
            schedule.start_time ||
            schedule.time?.start ||
            schedule.classSchedule?.startTime ||
            schedule.startHour
          );
          const scheduleEnd = parseTime(
            schedule.endTime ||
            schedule.end_time ||
            schedule.time?.end ||
            schedule.classSchedule?.endTime ||
            schedule.endHour
          );

          if (!scheduleStart || !scheduleEnd) return;

          const hasTimeConflict = hasTimeOverlap(sessionStart, sessionEnd, scheduleStart, scheduleEnd);

          if (hasTimeConflict) {
            const className = 
              schedule.className || 
              schedule.class?.name || 
              schedule.classSchedule?.class?.name ||
              'N/A';
            
            const displayDate = new Date(scheduleDateStr).toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            const conflictDetail = {
              className,
              date: displayDate,
              dateRaw: scheduleDateStr,
              time: `${scheduleStart} - ${scheduleEnd}`,
              newClassTime: `${sessionStart} - ${sessionEnd}`
            };

            studentConflicts.push(conflictDetail);
          }
        });
      });

      if (studentConflicts.length > 0) {
        conflicts.set(studentId, studentConflicts);
      }
    });

    return conflicts;
  }, [generatedSessions, studentSchedules]);

  const filteredRooms = useMemo(() => {
    // First filter by status - only show available rooms
    const availableRooms = rooms.filter(room => room.status === 'available');

    if (!generatedSessions.length || !existingSchedules.length) {
      return availableRooms;
    }

    const filtered = availableRooms.filter(
      (room) => {
        const roomId = room._id || room.id;
        const roomIdStr = String(roomId);

        const roomName = room.name || room.roomName || room.room_name || room.title || `Phòng ${roomId}`;

        const hasIdConflict = conflictingRoomIds.has(roomIdStr) || conflictingRoomIds.has(String(room.id));
        const hasNameConflict = conflictingRoomIds.has(roomName) ||
                                conflictingRoomIds.has(room.name) ||
                                conflictingRoomIds.has(room.roomName) ||
                                conflictingRoomIds.has(room.room_name);

        return !hasIdConflict && !hasNameConflict;
      }
    );

    return filtered;
  }, [generatedSessions, existingSchedules, rooms, conflictingRoomIds]);

  const filteredTeachers = useMemo(() => {
    if (!generatedSessions.length || Object.keys(teacherSchedules).length === 0) {
      return teachers;
    }

    const filtered = teachers.filter(
      (teacher) => {
        const teacherId = teacher._id || teacher.id;
        const teacherIdStr = String(teacherId);
        
        const hasIdConflict = conflictingTeacherIds.has(teacherIdStr) || conflictingTeacherIds.has(String(teacher.id));
        
        return !hasIdConflict;
      }
    );
    
    return filtered;
  }, [generatedSessions, teacherSchedules, teachers, conflictingTeacherIds]);


  useEffect(() => {
    if (
      formData.roomId &&
      !filteredRooms.some(room => {
        const roomId = room._id || room.id;
        return String(roomId) === String(formData.roomId) || String(room.id) === String(formData.roomId);
      })
    ) {
      setFormData(prev => ({ ...prev, roomId: '' }));
    }
  }, [filteredRooms, formData.roomId]);

  useEffect(() => {
    if (
      formData.teacherId &&
      !filteredTeachers.some(teacher => {
        const teacherId = teacher._id || teacher.id;
        return String(teacherId) === String(formData.teacherId) || String(teacher.id) === String(formData.teacherId);
      })
    ) {
      setFormData(prev => ({ ...prev, teacherId: '' }));
    }
  }, [filteredTeachers, formData.teacherId]);

  return (
    <Container fluid className="p-0" style={{ 
      minHeight: '100vh', 
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#fff'
    }}>
      {/* Header */}
      <div className="bg-main-600 text-white border-0 p-24" style={{ flexShrink: 0 }}>
        <div className="d-flex flex-column">
          <Button
            variant="link"
            onClick={onClose}
            className="text-white p-0 mb-16 align-self-start"
            style={{ 
              textDecoration: 'none', 
              fontSize: '16px',
              fontWeight: '500',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
          <h4 className="fw-bold mb-0">
            <i className="fas fa-plus-circle me-2"></i>
            Tạo lớp học mới
          </h4>
        </div>
      </div>

      <Form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Body - Scrollable */}
        <div className="p-24" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <div className="mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Thông tin cơ bản
            </h5>
            
            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Tên lớp <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: A1-Morning-01"
                    required
                    className="border-neutral-30 radius-8 px-16 py-10"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Loại Chương trình <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                    className="border-neutral-30 radius-8 px-16 py-10"
                  >
                    <option value="">-- Chọn loại chương trình --</option>
                    {availablePrograms.map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Cấp độ <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.program}
                    className="border-neutral-30 radius-8 px-16 py-10"
                  >
                    <option value="">
                      {!formData.program
                        ? '-- Vui lòng chọn loại chương trình trước --'
                        : '-- Chọn cấp độ --'}
                    </option>
                    {availableLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Program <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Select
                    name="programId"
                    value={formData.programId}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.level || filteredProgramsFromDB.length === 0}
                    className="border-neutral-30 radius-8 px-16 py-10"
                  >
                    <option value="">
                      {!formData.level
                        ? '-- Vui lòng chọn cấp độ trước --'
                        : filteredProgramsFromDB.length === 0
                        ? '-- Không có program phù hợp --'
                        : '-- Chọn program --'}
                    </option>
                    {filteredProgramsFromDB.map(prog => (
                      <option key={prog._id} value={prog._id}>
                        {prog.program_name} ({prog.code})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Course <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.programId || coursesLoading || courses.length === 0}
                    className="border-neutral-30 radius-8 px-16 py-10"
                  >
                    <option value="">
                      {!formData.programId
                        ? '-- Vui lòng chọn program trước --'
                        : coursesLoading
                        ? 'Đang tải danh sách course...'
                        : courses.length === 0
                        ? '-- Không có course phù hợp --'
                        : '-- Chọn course --'}
                    </option>
                    {courses.map(course => {
                      const courseId = course._id || course.id;
                      return (
                        <option key={courseId} value={courseId}>
                          {course.name} {course.numberOfSessions ? `(${course.numberOfSessions} buổi)` : ''}
                        </option>
                      );
                    })}
                  </Form.Select>
                  {selectedCourse && selectedCourse.numberOfSessions && (
                    <Form.Text className="text-neutral-500 text-12 d-block mt-4">
                      Course này có {selectedCourse.numberOfSessions} buổi học
                    </Form.Text>
                  )}
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Band</Form.Label>
                  <div className="border border-neutral-30 rounded-8 px-16 py-10 bg-neutral-25 text-neutral-700" style={{ minHeight: '38px', display: 'flex', alignItems: 'center' }}>
                    {formData.band || <span className="text-neutral-400">Chưa có band</span>}
                  </div>
                </Form.Group>
              </div>
            </div>
          </div>
                  
          <div className="mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Lịch học & Thời gian
            </h5>
            


            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Ngày khai giảng
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={getTodayDate()}
                    className={`border-neutral-30 radius-8 px-16 py-10 ${dateError ? 'border-danger' : ''}`}
                  />
                  {dateError && dateError.includes('quá khứ') && (
                    <Form.Text className="text-danger-600 text-12 d-block mt-4">
                      {dateError}
                    </Form.Text>
                  )}
                </Form.Group>
              </div>
              <div className="col-md-6">
                {formData.startDate && filledScheduleEntries.length > 0 && (() => {
                  // Calculate first class session
                  // Use local timezone to avoid date shifting issues
                  const [year, month, day] = formData.startDate.split('-').map(Number);
                  const startDate = new Date(year, month - 1, day);

                  const daysOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

                  // Find the earliest schedule entry
                  let firstSession = null;
                  let minDaysToAdd = Infinity;

                  filledScheduleEntries.forEach(entry => {
                    const targetDay = getDayOfWeekNumber(entry.day);
                    if (targetDay === null) return;

                    const currentDay = startDate.getDay();
                    let daysToAdd = targetDay - currentDay;
                    if (daysToAdd < 0) daysToAdd += 7;

                    if (daysToAdd < minDaysToAdd) {
                      minDaysToAdd = daysToAdd;
                      const sessionDate = new Date(startDate);
                      sessionDate.setDate(sessionDate.getDate() + daysToAdd);
                      firstSession = {
                        ...entry,
                        date: sessionDate,
                        dayName: daysOfWeek[targetDay]
                      };
                    }
                  });

                  if (firstSession) {
                    const dateStr = firstSession.date.toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });

                    return (
                      <div className="border border-info bg-info-subtle rounded-8 p-12">
                        <div className="text-info-700 fw-medium text-14 mb-4">
                          <i className="fas fa-info-circle me-2"></i>
                          Buổi học đầu tiên của lớp:
                        </div>
                        <div className="text-neutral-900 fw-semibold text-15">
                          {firstSession.dayName}, {dateStr} ({firstSession.startTime} - {firstSession.endTime})
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <Form.Group className="mb-12">
              <Form.Label className="text-neutral-700 fw-medium mb-8">
                Thời khóa biểu trong 1 tuần<span className="text-danger-600">*</span>
              </Form.Label>
              <p className="text-neutral-500 text-13 mb-0">
                Thêm nhiều buổi học với ngày và giờ khác nhau (ví dụ: Thứ 2: 08:00-10:00, Thứ 4: 18:00-20:00).
              </p>
            </Form.Group>

            <div className="d-flex flex-column gap-12">
              {formData.scheduleEntries.map((entry, index) => {
                const isDuplicate = duplicateEntryIndices.includes(index);
                return (
                <div
                  key={entry.id}
                  className={`border rounded-12 p-16 ${isDuplicate ? 'border-danger border-2' : 'border-neutral-100'}`}
                >
                  <div className="d-flex justify-content-between align-items-center mb-12">
                    <span className="text-neutral-700 fw-semibold text-14">
                      Buổi {index + 1}
                    </span>
                    {formData.scheduleEntries.length > 1 && (
                      <Button
                        type="button"
                        className="btn-outline-danger text-13 fw-medium px-14 py-6 radius-8"
                        onClick={() => removeScheduleEntry(entry.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#dc3545',
                          borderColor: '#dc3545',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc3545';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.borderColor = '#dc3545';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#dc3545';
                          e.currentTarget.style.borderColor = '#dc3545';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <i className="fas fa-trash-alt me-1"></i>
                        Xóa
                      </Button>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label className="text-neutral-700 fw-medium mb-8">
                          Ngày học
                        </Form.Label>
                        <Form.Select
                          value={entry.day}
                          onChange={(e) =>
                            handleScheduleEntryChange(entry.id, 'day', e.target.value)
                          }
                          className="border-neutral-30 radius-8 px-16 py-10"
                          required
                        >
                          <option value="">-- Chọn ngày --</option>
                          {daysOfWeek.map(day => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label className="text-neutral-700 fw-medium mb-8">
                          Giờ bắt đầu
                        </Form.Label>
                        <Form.Control
                          type="time"
                          value={entry.startTime}
                          onChange={(e) =>
                            handleScheduleEntryChange(entry.id, 'startTime', e.target.value)
                          }
                          className="border-neutral-30 radius-8 px-16 py-10"
                          required
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label className="text-neutral-700 fw-medium mb-8">
                          Giờ kết thúc
                        </Form.Label>
                        <Form.Control
                          type="time"
                          value={entry.endTime}
                          onChange={(e) =>
                            handleScheduleEntryChange(entry.id, 'endTime', e.target.value)
                          }
                          className="border-neutral-30 radius-8 px-16 py-10"
                          required
                        />
                      </Form.Group>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            <Button
              type="button"
              onClick={addScheduleEntry}
              className="btn-outline-main text-14 fw-medium px-16 py-8 radius-8 mt-16"
            >
              <i className="fas fa-plus me-2"></i>
              Thêm buổi học
            </Button>

            {scheduleEntriesError && (
              <Alert variant="danger" className="mt-12 mb-0">
                {scheduleEntriesError}
              </Alert>
            )}
          </div>  
                    <div className="mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Tài nguyên
            </h5>
            
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Giáo viên
                  </Form.Label>
                  <Form.Select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
                    disabled={
                      teachers.length === 0 ||
                      !formData.course ||
                      !formData.startDate ||
                      !filledScheduleEntries.length
                    }
                  >
                    <option value="">
                      {!formData.course || !formData.startDate || !filledScheduleEntries.length
                        ? '-- Vui lòng chọn course, ngày khai giảng và thời khóa biểu trước --'
                        : '-- Chọn giáo viên --'}
                    </option>
                    {teachers.length === 0 ? (
                      <option value="" disabled>
                        Đang tải danh sách giáo viên...
                      </option>
                    ) : filteredTeachers.length === 0 && generatedSessions.length > 0 ? (
                      <option value="" disabled>
                        Không còn giáo viên phù hợp (tất cả đều bị trùng lịch)
                      </option>
                    ) : null}
                    {filteredTeachers.map(t => {
                      const teacherId = t._id || t.id;
                      const teacherName = 
                        t.name || 
                        t.teacherName || 
                        t.fullName ||
                        (t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : null) ||
                        (t.firstName || t.lastName) ||
                        t.username ||
                        t.email?.split('@')[0] ||
                        `Giáo viên ${teacherId}`;
                      return (
                        <option key={teacherId} value={teacherId}>
                          {teacherName}
                        </option>
                      );
                    })}
                  </Form.Select>
                  <Form.Text className="text-neutral-500 text-12">
                    {!formData.course || !formData.startDate || !filledScheduleEntries.length
                      ? 'Vui lòng chọn course, ngày khai giảng và thời khóa biểu để có thể chọn giáo viên phù hợp.'
                      : teachers.length === 0
                      ? 'Đang tải danh sách giáo viên...'
                      : filteredTeachers.length === 0 && generatedSessions.length > 0
                      ? 'Không còn giáo viên phù hợp (tất cả đều bị trùng lịch)'
                      : generatedSessions.length > 0
                      ? `Có ${filteredTeachers.length} giáo viên phù hợp (chưa bị trùng lịch)`
                      : `Có ${teachers.length} giáo viên.`}
                  </Form.Text>
                  {conflicts.teacher && conflicts.teacher.length > 0 && (
                    <Alert variant="warning" className="mt-12 mb-0">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-exclamation-triangle me-2 mt-1 text-warning"></i>
                        <div className="flex-grow-1">
                          <strong className="text-danger"> Xung đột lịch giáo viên:</strong>
                          <ul className="mb-0 mt-2" style={{ fontSize: '13px' }}>
                            {conflicts.teacher.map((c, idx) => (
                              <li key={idx}>
                              Ngày <strong>{c.date}</strong>: Giáo viên đã có lớp "<strong>{c.className}</strong>" 
                              học từ <strong>{c.time}</strong>, trùng với lịch mới <strong>{c.conflictingTime}</strong>
                            </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Alert>
                  )}
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Phòng học</Form.Label>
                  <Form.Select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
                    disabled={
                      roomLoading ||
                      !formData.course ||
                      !formData.startDate ||
                      !filledScheduleEntries.length
                    }
                  >
                    <option value="">
                      {!formData.course || !formData.startDate || !filledScheduleEntries.length
                        ? '-- Vui lòng chọn course, ngày khai giảng và thời khóa biểu trước --'
                        : roomLoading
                        ? 'Đang kiểm tra phòng trống...'
                        : '-- Chọn phòng học --'}
                    </option>
                    {!roomLoading && filteredRooms.length === 0 && (
                      <option value="" disabled>
                        Không còn phòng phù hợp
                      </option>
                    )}
                    {!roomLoading && filteredRooms.map(r => {
                      const roomId = r._id || r.id;
                      const roomName = r.name || r.roomName || r.room_name || r.title || `Phòng ${roomId}`;
                      const capacity = r.capacity || r.maxCapacity || r.maxStudents || 'N/A';
                      return (
                        <option key={roomId} value={roomId}>
                          {roomName} (Sức chứa: {capacity})
                        </option>
                      );
                    })}
                  </Form.Select>
                  <Form.Text className="text-neutral-500 text-12">
                    {!formData.course || !formData.startDate || !filledScheduleEntries.length
                      ? 'Vui lòng chọn course, ngày khai giảng và thời khóa biểu để có thể chọn phòng học phù hợp.'
                      : 'Chỉ hiển thị phòng chưa bị trùng với lịch đã chọn.'}
                  </Form.Text>
                  {conflicts.room && conflicts.room.length > 0 && (
                    <Alert variant="warning" className="mt-12 mb-0">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-exclamation-triangle me-2 mt-1 text-warning"></i>
                        <div className="flex-grow-1">
                          <strong className="text-danger"> Xung đột phòng học:</strong>
                          <ul className="mb-0 mt-2" style={{ fontSize: '13px' }}>
                            {conflicts.room.map((c, idx) => (
                              <li key={idx}>
                              Ngày <strong>{c.date}</strong>: Phòng học đã được lớp "<strong>{c.className}</strong>" 
                              sử dụng từ <strong>{c.time}</strong>, trùng với lịch mới <strong>{c.conflictingTime}</strong>
                            </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Alert>
                  )}
                  {roomError && (
                    <Alert variant="warning" className="mt-12 mb-0">
                      {roomError}
                    </Alert>
                  )}
                </Form.Group>
              </div>
            </div>
          </div>

          <div className="mb-24">
            <div className="d-flex justify-content-between align-items-center mb-16 pb-12 border-bottom border-neutral-100">
              <h5 className="text-neutral-900 fw-semibold mb-0">
                Học viên
              </h5>
              {formData.selectedStudents && formData.selectedStudents.length > 0 && (
                <div className="d-flex align-items-center gap-12">
                  <span className={`badge ${capacityWarning ? 'bg-danger' : 'bg-main-600'} text-white px-16 py-8 radius-8 text-14 fw-semibold`}>
                    Tổng cộng: {formData.selectedStudents.length} học viên
                  </span>
                  {formData.roomId && (() => {
                    const selectedRoom = rooms.find(r => (r._id || r.id) === formData.roomId);
                    if (selectedRoom) {
                      const roomCapacity = selectedRoom.capacity || selectedRoom.maxCapacity || selectedRoom.maxStudents;
                      return (
                        <span className="badge bg-info text-white px-12 py-6 radius-6 text-12">
                          Sức chứa phòng: {roomCapacity}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
            
            {capacityWarning && (
              <Alert variant={capacityWarning.type} className="mb-16">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {capacityWarning.message}
              </Alert>
            )}
            
            <div className="mb-16">
              <div className="d-flex justify-content-between align-items-center mb-12">
                <Form.Label className="text-neutral-700 fw-medium mb-0">
                  Danh sách học viên đã chọn
                </Form.Label>
                <div className="d-flex gap-8">
                  <Button
                    type="button"
                    variant="outline-success"
                    size="sm"
                    onClick={handleExcelImport}
                    disabled={importingExcel}
                    className="text-13 fw-medium px-16 py-8 radius-8"
                  >
                    <i className={`fas ${importingExcel ? 'fa-spinner fa-spin' : 'fa-file-excel'} me-2`}></i>
                    {importingExcel ? 'Đang xử lý...' : 'Import từ Excel'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowSelectStudentModal(true)}
                    disabled={!formData.course}
                    className="text-13 fw-medium px-16 py-8 radius-8"
                    title={!formData.course ? 'Vui lòng chọn course trước khi thêm học viên' : ''}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Thêm học viên
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleExcelFileChange}
                style={{ display: 'none' }}
              />

              <div 
                className="border border-neutral-100 rounded-12 p-16"
                style={{ maxHeight: '300px', overflowY: 'auto' }}
              >
                {formData.selectedStudents.length === 0 ? (
                  <div className="text-center text-neutral-500 py-40">
                    <i className="fas fa-user-slash fa-2x mb-12 text-neutral-300"></i>
                    <div className="text-14">Chưa có học viên nào được chọn</div>
                    <div className="text-12 mt-4">Nhấn "Thêm học viên" để chọn học viên cho lớp học</div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-8">
                    {formData.selectedStudents.map(selectedStudentId => {
                      const student = students.find(s => {
                        const studentId = s._id || s.id;
                        return String(studentId) === String(selectedStudentId);
                      });
                      
                      if (!student) {
                        return (
                          <div
                            key={selectedStudentId}
                            className="d-flex align-items-center justify-content-between p-12 rounded-8 border border-neutral-100 bg-neutral-25"
                          >
                            <div className="flex-grow-1">
                              <div className="fw-medium text-neutral-600 text-14">
                                Đang tải thông tin...
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveStudent(selectedStudentId)}
                              className="text-12 fw-medium px-12 py-6 radius-8"
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          </div>
                        );
                      }
                      
                      const displayName = student.fullName || student.name || student.username || student.email || 'N/A';
                      const email = student.email || 'N/A';
                      const username = student.username || 'N/A';
                      const studentConflicts = conflictingStudentIds.get(String(selectedStudentId));
                      const hasConflict = !!studentConflicts;
                      
                      return (
                        <div
                          key={selectedStudentId}
                          className={`d-flex align-items-center justify-content-between p-12 rounded-8 border ${
                            hasConflict 
                              ? 'border-danger-600 bg-danger-50' 
                              : 'border-main-200 bg-main-50'
                          }`}
                        >
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-8">
                              <div className="fw-medium text-neutral-900 text-14">
                                {displayName}
                              </div>
                              {hasConflict && (
                                <span 
                                  className="badge bg-danger-600 text-white px-8 py-4 radius-4 text-11 fw-semibold"
                                  title="Học viên này có lịch học trùng giờ với lớp đang tạo"
                                >
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  Trùng giờ
                                </span>
                              )}
                            </div>
                            <div className={`text-12 ${hasConflict ? 'text-danger-700' : 'text-neutral-500'}`}>
                              {email} • {username}
                              {hasConflict && studentConflicts && (
                                <div className="text-danger-600 text-11 mt-4">
                                  <i className="fas fa-info-circle me-1"></i>
                                  <strong>Trùng giờ với:</strong>
                                  <div className="mt-2 ms-12">
                                    {studentConflicts.map((conflict, idx) => (
                                      <div key={idx} className="mb-2">
                                        • <strong>{conflict.className}</strong> - {conflict.date} ({conflict.time})
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveStudent(selectedStudentId)}
                            className="text-12 fw-medium px-12 py-6 radius-8"
                            title="Xóa học viên khỏi danh sách"
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center gap-8 mt-8">
                <Form.Text className="text-neutral-500 text-12 mb-0">
                  <i className="fas fa-info-circle me-1"></i>
                  Có thể thêm học viên sau khi tạo lớp.
                </Form.Text>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="text-12 p-0 text-decoration-none"
                  style={{ padding: 0, lineHeight: 'inherit' }}
                >
                  <i className="fas fa-download me-1"></i>
                  Tải file mẫu Excel
                </Button>
              </div>
              {conflicts.students && conflicts.students.length > 0 && (
                <Alert variant="warning" className="mt-12 mb-0">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-exclamation-triangle me-2 mt-1 text-warning"></i>
                    <div className="flex-grow-1">
                      <strong className="text-danger"> Xung đột lịch học viên:</strong>
                      <div className="mt-2" style={{ fontSize: '13px' }}>
                        {conflicts.students.map((studentConflict, idx) => (
                          <div key={idx} className="mb-2">
                            <strong>Học viên "{studentConflict.studentName}":</strong>
                            <ul className="mb-0 mt-1 ms-3">
                              {studentConflict.conflicts.map((c, cIdx) => (
                                <li key={cIdx}>
                                  Ngày <strong>{c.date}</strong>: Lớp "<strong>{c.className}</strong>" 
                                  từ <strong>{c.time}</strong>, trùng với lịch mới <strong>{c.conflictingTime}</strong>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Alert>
              )}
              {conflictingStudentIds.size > 0 && (!conflicts.students || conflicts.students.length === 0) && (
                <Alert variant="warning" className="mt-12 mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Cảnh báo:</strong> Có {conflictingStudentIds.size} học viên bị trùng giờ học với lớp đang tạo. 
                  Vui lòng kiểm tra lại lịch học của các học viên này (xem chi tiết bên trên).
                </Alert>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-25 border-top border-neutral-200 p-20" style={{ flexShrink: 0 }}>
          <div className="d-flex justify-content-end gap-12">
            <Button 
              className="btn-outline-neutral text-15 fw-medium px-20 py-10 radius-8"
              onClick={onClose}
            >
              <i className="fas fa-times me-2"></i> Hủy
            </Button>
            <Button 
              type="submit" 
              className="btn-main text-15 fw-semibold px-24 py-10 radius-8"
              disabled={conflicts.hasConflict || checkingConflicts}
              title={conflicts.hasConflict ? 'Vui lòng giải quyết các xung đột lịch học trước khi tạo lớp' : ''}
            >
              <i className="fas fa-check me-2"></i> Tạo lớp học
              {conflicts.hasConflict && (
                <span className="ms-2">
                  <i className="fas fa-exclamation-triangle"></i>
                </span>
              )}
            </Button>
          </div>
        </div>
      </Form>

      {/* Select Student Modal */}
      <SelectStudentModal
        show={showSelectStudentModal}
        onClose={() => setShowSelectStudentModal(false)}
        onConfirm={handleStudentsConfirmed}
        initialSelectedStudents={formData.selectedStudents}
        generatedSessions={generatedSessions}
        courseId={formData.course}
      />

      {/* Import Result Modal */}
      <Modal 
        show={showImportResultModal} 
        onHide={() => setShowImportResultModal(false)} 
        centered
        size="md"
      >
        <Modal.Header closeButton className="bg-main-600 text-white border-0 p-24">
          <Modal.Title className="fw-bold">
            <i className="fas fa-file-excel me-2"></i>
            Kết quả Import Excel
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-24">
          {importResult?.error ? (
            <Alert variant="danger" className="mb-0">
              <i className="fas fa-exclamation-circle me-2"></i>
              {importResult.error}
            </Alert>
          ) : (
            <>
              {importResult?.success > 0 && (
                <Alert variant="success" className="mb-16">
                  <i className="fas fa-check-circle me-2"></i>
                  <strong>Đã import thành công {importResult.success} học viên</strong>
                </Alert>
              )}
              
              {importResult?.success === 0 && importResult?.total > 0 && (
                <Alert variant="warning" className="mb-16">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Không tìm thấy học viên nào phù hợp trong hệ thống</strong>
                </Alert>
              )}

              {importResult?.notFound && importResult.notFound.length > 0 && (
                <div className="mb-0">
                  <div className="text-neutral-700 fw-medium mb-8">
                    <i className="fas fa-info-circle me-2"></i>
                    Không tìm thấy hoặc chưa enroll vào course: {importResult.notFound.length} học viên
                  </div>
                  <div 
                    className="border border-neutral-100 rounded-8 p-12 bg-neutral-25"
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                  >
                    <div className="d-flex flex-column gap-4">
                      {importResult.notFound.slice(0, 20).map((item, index) => (
                        <div key={index} className="text-neutral-600 text-13">
                          • {item}
                        </div>
                      ))}
                      {importResult.notFound.length > 20 && (
                        <div className="text-neutral-500 text-12 mt-4">
                          ... và {importResult.notFound.length - 20} học viên khác
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-neutral-25 border-0 p-20">
          <Button 
            className="btn-main text-15 fw-semibold px-24 py-10 radius-8"
            onClick={() => setShowImportResultModal(false)}
          >
            <i className="fas fa-check me-2"></i> OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Error Modal - Modal lỗi chung cho tạo class */}
      <Modal 
        show={showErrorModal} 
        onHide={() => setShowErrorModal(false)} 
        centered
        size="md"
      >
        <Modal.Header closeButton className="bg-danger-600 text-white border-0 p-24">
          <Modal.Title className="fw-bold">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Lỗi tạo lớp học
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-24">
          <Alert variant="danger" className="mb-0">
            <div className="d-flex align-items-start">
              <i className="fas fa-exclamation-circle me-3 mt-1" style={{ fontSize: '20px' }}></i>
              <div className="flex-grow-1">
                <p className="mb-0 fw-medium" style={{ fontSize: '15px' }}>
                  {errorMessage}
                </p>
              </div>
            </div>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="bg-neutral-25 border-0 p-20">
          <Button 
            className="btn-danger text-15 fw-semibold px-24 py-10 radius-8"
            onClick={() => setShowErrorModal(false)}
          >
            <i className="fas fa-check me-2"></i> Đã hiểu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateClassModal;
