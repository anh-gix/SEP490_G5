import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from 'xlsx';
import scheduleService from '../../services/scheduleService';
import roomService from '../../services/roomService';
import teacherService from '../../services/teacherService';
import studentService from '../../services/studentService';
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
  const [availablePrograms, setAvailablePrograms] = useState([]); // Programs filtered by selected level
  const [availableLevels, setAvailableLevels] = useState([]); // Levels filtered by selected program

  // Program name to type mapping
  const programTypeMap = {
    'IELTS': 'ielts',
    'TOEIC': 'toeic',
    'Tiếng Anh Giao tiếp': 'cam'
  };

  // Type to program name mapping
  const typeProgramMap = {
    'ielts': 'IELTS',
    'toeic': 'TOEIC',
    'cam': 'Tiếng Anh Giao tiếp'
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
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

      // Extract emails/phones from first column (skip header row)
      const emailsOrPhones = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row[0]) {
          const value = String(row[0]).trim();
          if (value) {
            emailsOrPhones.push(value);
          }
        }
      }

      if (emailsOrPhones.length === 0) {
        setImportResult({
          success: 0,
          notFound: [],
          total: 0,
          error: 'Không tìm thấy email hoặc số điện thoại nào trong file Excel'
        });
        setShowImportResultModal(true);
        e.target.value = '';
        return;
      }

      // Match students by email or phone
      const matchedStudentIds = [];
      const notFound = [];

      emailsOrPhones.forEach((value) => {
        const normalizedValue = value.toLowerCase().trim();
        const normalizedPhone = normalizePhone(value);

        const foundStudent = students.find((student) => {
          const studentEmail = (student.email || '').toLowerCase().trim();
          const studentPhone = normalizePhone(student.phone || '');

          return studentEmail === normalizedValue || 
                 studentPhone === normalizedPhone;
        });

        if (foundStudent) {
          const studentId = foundStudent._id || foundStudent.id;
          if (studentId && !matchedStudentIds.includes(String(studentId))) {
            matchedStudentIds.push(String(studentId));
          }
        } else {
          notFound.push(value);
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
        total: emailsOrPhones.length
      });
      setShowImportResultModal(true);

    } catch (error) {
      console.error('Error reading Excel file:', error);
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

  // Auto-fetch band when program and level are selected
  useEffect(() => {
    const fetchBand = async () => {
      console.log('🔄 useEffect triggered - program:', formData.program, 'level:', formData.level);
      
      if (!formData.program || !formData.level) {
        // Clear band if program or level is empty
        console.log('⚠️ Program or level is empty, clearing band');
        setFormData(prev => ({ ...prev, band: '' }));
        return;
      }

      const type = getTypeFromProgram(formData.program);
      console.log('📋 Mapped program to type:', formData.program, '→', type);
      
      if (!type) {
        console.warn('⚠️ Không tìm thấy type cho program:', formData.program);
        return;
      }

      try {
        console.log('🌐 Fetching band from API with params:', { type, level: formData.level });
        const response = await axios.get('http://localhost:8080/api/v1/courses/band', {
          params: {
            type: type,
            level: formData.level
          }
        });

        console.log('✅ API Response:', response.data);

        if (response.data && response.data.success && response.data.band) {
          console.log('✅ Setting band to:', response.data.band);
          setFormData(prev => ({ ...prev, band: response.data.band }));
        } else {
          console.warn('⚠️ No band found in response, clearing band');
          // Clear band if no mapping found
          setFormData(prev => ({ ...prev, band: '' }));
        }
      } catch (error) {
        console.error('❌ Error fetching band:', error);
        if (error.response) {
          console.error('❌ Response data:', error.response.data);
          console.error('❌ Response status:', error.response.status);
        }
        // Don't clear band on error, keep existing value
      }
    };

    fetchBand();
  }, [formData.program, formData.level]);

  // Fetch courses when program is selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!formData.program) {
        setCourses([]);
        setSelectedCourse(null);
        setFormData(prev => ({ ...prev, course: '' }));
        return;
      }

      try {
        setCoursesLoading(true);
        const response = await axios.get('http://localhost:8080/api/v1/courses/by-program', {
          params: {
            programName: formData.program,
            level: formData.level // Gửi cả level để filter chính xác
          }
        });

        if (response.data && response.data.success && response.data.courses) {
          setCourses(response.data.courses);
          // Clear course selection if current course is not in the new list
          if (formData.course) {
            const courseExists = response.data.courses.some(c => 
              (c._id || c.id) === formData.course
            );
            if (!courseExists) {
              setFormData(prev => ({ ...prev, course: '' }));
              setSelectedCourse(null);
            }
          }
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('❌ Error fetching courses:', error);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [formData.program, formData.level]);

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
        const response = await axios.get(`http://localhost:8080/api/v1/courses/${formData.course}/details`);
        if (response.data && response.data.success && response.data.data) {
          setSelectedCourse(response.data.data);
        } else {
          // Fallback to course from list if available
          if (courseFromList) {
            setSelectedCourse(courseFromList);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching course details:', error);
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
            message: `⚠️ Cảnh báo: Số học viên (${studentCount}) vượt quá sức chứa của phòng (${roomCapacity} học viên). Vui lòng chọn phòng lớn hơn hoặc giảm số học viên.`
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

    // Validate teacher is selected
    if (!formData.teacherId) {
      setErrorMessage('Vui lòng chọn giáo viên!');
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
      teacher: formData.teacherId, // Map teacherId to teacher for backend
      room: formData.roomId // Map roomId to room for backend
    };

    // Remove selectedStudents, teacherId, roomId from submitData as they're now mapped
    delete submitData.selectedStudents;
    delete submitData.teacherId;
    delete submitData.roomId;

    onSubmit(submitData);
  };

  // Fetch types and levels from program table on mount
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch all types and levels from program table
        const [typesResponse, levelsResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/courses/all-types'),
          axios.get('http://localhost:8080/api/v1/courses/all-levels')
        ]);
        
        if (typesResponse.data?.success && typesResponse.data.types) {
          const allTypes = typesResponse.data.types;
          const allPrograms = allTypes.map(type => typeProgramMap[type]).filter(Boolean);
          setAvailablePrograms(allPrograms);
          console.log('✅ Loaded types from program table:', allTypes.length);
        }
        
        if (levelsResponse.data?.success && levelsResponse.data.levels) {
          const allLevels = levelsResponse.data.levels;
          setAvailableLevels(allLevels);
          console.log('✅ Loaded levels from program table:', allLevels.length);
        }
        
        // Also fetch mappings for band lookup (still needed for band display)
        try {
          const mappingsResponse = await axios.get('http://localhost:8080/api/v1/courses/mappings');
          if (mappingsResponse.data && mappingsResponse.data.success && mappingsResponse.data.mappings) {
            setMappings(mappingsResponse.data.mappings);
            console.log('✅ Loaded mappings from program table:', mappingsResponse.data.mappings.length);
          }
        } catch (mappingsError) {
          console.error('❌ Error fetching mappings:', mappingsError);
        }
      } catch (error) {
        console.error('❌ Error fetching course data:', error);
      }
    };
    fetchCourseData();
  }, []);

  // Filter levels based on selected program
  useEffect(() => {
    const filterLevels = async () => {
      if (!formData.program) {
        // If no program selected, show all levels from program table
        try {
          const response = await axios.get('http://localhost:8080/api/v1/courses/all-levels');
          if (response.data?.success && response.data.levels) {
            setAvailableLevels(response.data.levels);
          }
        } catch (error) {
          console.error('❌ Error fetching all levels:', error);
        }
        return;
      }

      const type = getTypeFromProgram(formData.program);
      if (!type) {
        setAvailableLevels([]);
        return;
      }

      // Fetch levels for this type from program table
      try {
        const response = await axios.get('http://localhost:8080/api/v1/courses/levels', {
          params: { type }
        });
        if (response.data?.success && response.data.levels) {
          setAvailableLevels(response.data.levels);
          
          // If current level is not available for selected program, clear it
          if (formData.level && !response.data.levels.includes(formData.level)) {
            setFormData(prev => ({ ...prev, level: '', band: '' }));
          }
        }
      } catch (error) {
        console.error('❌ Error fetching levels by type:', error);
      }
    };
    
    filterLevels();
  }, [formData.program]);

  // Filter programs based on selected level
  useEffect(() => {
    const filterPrograms = async () => {
      if (!formData.level) {
        // If no level selected, show all types from program table
        try {
          const response = await axios.get('http://localhost:8080/api/v1/courses/all-types');
          if (response.data?.success && response.data.types) {
            const allTypes = response.data.types;
            const allPrograms = allTypes.map(type => typeProgramMap[type]).filter(Boolean);
            setAvailablePrograms(allPrograms);
          }
        } catch (error) {
          console.error('❌ Error fetching all types:', error);
        }
        return;
      }

      // Fetch types for this level from program table
      try {
        const response = await axios.get('http://localhost:8080/api/v1/courses/types', {
          params: { level: formData.level }
        });
        if (response.data?.success && response.data.types) {
          const programsForLevel = response.data.types
            .map(type => typeProgramMap[type])
            .filter(Boolean);
          setAvailablePrograms(programsForLevel);

          // If current program is not available for selected level, clear it
          if (formData.program && !programsForLevel.includes(formData.program)) {
            setFormData(prev => ({ ...prev, program: '', band: '' }));
          }
        }
      } catch (error) {
        console.error('❌ Error fetching types by level:', error);
      }
    };
    
    filterPrograms();
  }, [formData.level]);

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
        // Sử dụng mock data nếu API lỗi
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
          setRooms(fetchedRooms);
        }
      } catch (error) {
        // Sử dụng mock data nếu API lỗi
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        console.log('🔍 Fetching teachers...');
        const response = await teacherService.getAllTeachers();
        console.log('📋 API Response:', response);
        
        if (response && (response.teachers || response.data)) {
          const fetchedTeachers = response.teachers || response.data || [];
          console.log('📋 Fetched teachers count:', fetchedTeachers.length);
          if (fetchedTeachers.length > 0) {
            console.log('📋 Teacher đầu tiên:', fetchedTeachers[0]);
            console.log('📋 Tất cả keys trong teacher:', Object.keys(fetchedTeachers[0]));
          } else {
            console.warn('⚠️ Không có giáo viên nào được trả về từ API');
          }
          setTeachers(fetchedTeachers);
        } else {
          console.warn('⚠️ API response không có teachers hoặc data field:', response);
          setTeachers([]);
        }
      } catch (error) {
        console.error('❌ Lỗi khi fetch teachers:', error);
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
        console.log('🔍 Fetching students...');
        // Không filter theo status vì User model không có field status
        const response = await studentService.getAllStudents();
        console.log('📋 Students API Response:', response);
        
        if (response && (response.students || response.data)) {
          const fetchedStudents = response.students || response.data || [];
          console.log('📋 Fetched students count:', fetchedStudents.length);
          setStudents(fetchedStudents);
        } else {
          console.warn('⚠️ API response không có students hoặc data field:', response);
          setStudents([]);
          setStudentsError('Không tìm thấy dữ liệu học viên');
        }
      } catch (error) {
        console.error('❌ Lỗi khi fetch students:', error);
        setStudents([]);
        const errorMessage = error.message || 'Không thể tải danh sách học viên';
        setStudentsError(errorMessage);
        console.error('❌ Error details:', error);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Cập nhật mock data với _id từ DB sau khi fetch teachers
  useEffect(() => {
    if (USE_MOCK_DATA && teachers.length > 0) {
      // Tạo map teacherName -> _id từ teachers
      const teacherNameToIdMap = {};
      teachers.forEach(teacher => {
        const teacherName = teacher.name || teacher.teacherName || teacher.fullName;
        const teacherId = teacher._id || teacher.id;
        if (teacherName && teacherId) {
          teacherNameToIdMap[teacherName] = teacherId;
        }
      });

      // Cập nhật existingSchedules với _id từ DB
      setExistingSchedules(prevSchedules => {
        const updatedSchedules = prevSchedules.map(schedule => {
          if (schedule.teacherName && teacherNameToIdMap[schedule.teacherName]) {
            return {
              ...schedule,
              teacherId: teacherNameToIdMap[schedule.teacherName] // Cập nhật với _id từ DB
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
    
    // If it's a date string, parse it first
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
    return startA < endB && startB < endA;
  };

  const hasDateRangeOverlap = (startDateA, endDateA, startDateB, endDateB) => {
    if (!startDateA || !endDateA || !startDateB || !endDateB) return true; // Nếu thiếu thông tin, coi như có overlap để an toàn
    
    const startA = new Date(startDateA);
    const endA = new Date(endDateA);
    const startB = new Date(startDateB);
    const endB = new Date(endDateB);
    
    // Kiểm tra overlap: startA < endB && startB < endA
    return startA <= endB && startB <= endA;
  };

  // Convert day string to day of week number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
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

  // Find the next occurrence of a day of week from a start date
  const findNextDayOfWeek = (startDate, targetDayOfWeek) => {
    const start = new Date(startDate);
    const currentDay = start.getDay();
    let daysToAdd = (targetDayOfWeek - currentDay + 7) % 7;
    if (daysToAdd === 0 && start.getTime() < new Date().getTime()) {
      daysToAdd = 7; // If today is the target day but in the past, go to next week
    }
    const result = new Date(start);
    result.setDate(start.getDate() + daysToAdd);
    return result;
  };

  // Generate all sessions that will be created
  const generateSessions = (startDate, scheduleEntries, numberOfSessions) => {
    if (!startDate || !scheduleEntries.length || !numberOfSessions) {
      return [];
    }

    const sessions = [];
    const start = new Date(startDate);
    
    // Find first occurrence of each day of week from start date
    const firstOccurrences = {};
    scheduleEntries.forEach(entry => {
      const dayOfWeek = getDayOfWeekNumber(entry.day);
      if (dayOfWeek !== null && !firstOccurrences[dayOfWeek]) {
        firstOccurrences[dayOfWeek] = findNextDayOfWeek(start, dayOfWeek);
      }
    });

    // Generate sessions in round-robin fashion
    let entryIndex = 0;
    let weekOffset = 0;

    for (let i = 0; i < numberOfSessions; i++) {
      const entry = scheduleEntries[entryIndex % scheduleEntries.length];
      const dayOfWeek = getDayOfWeekNumber(entry.day);
      
      if (dayOfWeek === null) {
        entryIndex++;
        continue;
      }

      // Get the first occurrence of this day
      const firstOccurrence = firstOccurrences[dayOfWeek];
      
      // Calculate the date for this session
      const sessionDate = new Date(firstOccurrence);
      sessionDate.setDate(firstOccurrence.getDate() + (weekOffset * 7));

      sessions.push({
        date: sessionDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        dayOfWeek: dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime
      });

      // Move to next entry (round-robin)
      entryIndex++;
      // If we've gone through all entries, move to next week
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

  // Generate sessions that will be created
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

    // Check each generated session against existing schedules
    generatedSessions.forEach((session) => {
      const sessionDate = session.date;
      const sessionStart = parseTime(session.startTime);
      const sessionEnd = parseTime(session.endTime);

      existingSchedules.forEach((schedule) => {
        // API populate room với _id và room_name
        const scheduleRoomId =
          schedule.room?._id?.toString() || // Nếu room được populate
          schedule.roomId ||
          schedule.roomID ||
          schedule.room?.id ||
          schedule.room?.id?.toString();
        const scheduleRoomName = 
          schedule.room?.room_name || // API trả về room_name, không phải name
          schedule.roomName || 
          schedule.room?.name;

        if (!scheduleRoomId && !scheduleRoomName) {
          return;
        }

        // Get schedule date
        const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
        if (!scheduleDate) {
          return;
        }

        // Format schedule date to YYYY-MM-DD for comparison
        const scheduleDateStr = new Date(scheduleDate).toISOString().split('T')[0];

        // Check if dates match
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

        // Check if times overlap
        const hasTimeConflict = hasTimeOverlap(sessionStart, sessionEnd, scheduleStart, scheduleEnd);

        // Conflict if same date and overlapping time
        if (hasTimeConflict) {
          console.log('🔴 CONFLICT Room:', {
            room: scheduleRoomName || `Room ID: ${scheduleRoomId}`,
            sessionDate: sessionDate,
            sessionTime: `${sessionStart} - ${sessionEnd}`,
            scheduleDate: scheduleDateStr,
            scheduleTime: `${scheduleStart} - ${scheduleEnd}`
          });
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

  // Fetch teacher schedules - need to get all schedules for conflict checking
  useEffect(() => {
    const fetchTeacherSchedules = async () => {
      if (!teachers.length || !generatedSessions.length) {
        return;
      }

      const schedulesMap = {};
      
      // Get date range from generated sessions
      if (generatedSessions.length === 0) return;
      
      const sessionDates = generatedSessions.map(s => s.date).sort();
      const minDate = sessionDates[0];
      const maxDate = sessionDates[sessionDates.length - 1];
      
      // Fetch schedules for each teacher
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
            console.error(`Error fetching schedule for teacher ${teacherId}:`, error);
            schedulesMap[String(teacherId)] = [];
          }
        })
      );

      setTeacherSchedules(schedulesMap);
    };

    fetchTeacherSchedules();
  }, [teachers, generatedSessions]);

  // Fetch student schedules - need to get all schedules for conflict checking
  useEffect(() => {
    const fetchStudentSchedules = async () => {
      if (!formData.selectedStudents.length || !generatedSessions.length) {
        setStudentSchedules({});
        return;
      }

      const schedulesMap = {};
      
      // Get date range from generated sessions
      const sessionDates = generatedSessions.map(s => s.date).sort();
      const minDate = sessionDates[0];
      const maxDate = sessionDates[sessionDates.length - 1];
      
      // Fetch schedules for each selected student
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
            console.error(`Error fetching schedule for student ${studentId}:`, error);
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

    // Check each teacher's schedules
    Object.entries(teacherSchedules).forEach(([teacherId, schedules]) => {
      if (!schedules || schedules.length === 0) return;

      // Check each generated session against teacher's schedules
      generatedSessions.forEach((session) => {
        const sessionDate = session.date;
        const sessionStart = parseTime(session.startTime);
        const sessionEnd = parseTime(session.endTime);

        schedules.forEach((schedule) => {
          // Get schedule date
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
          if (!scheduleDate) return;

          // Format schedule date to YYYY-MM-DD for comparison
          const scheduleDateStr = new Date(scheduleDate).toISOString().split('T')[0];

          // Check if dates match
          if (scheduleDateStr !== sessionDate) {
            return;
          }

          // Check time overlap
          const scheduleStart = parseTime(schedule.startTime);
          const scheduleEnd = parseTime(schedule.endTime);
          const hasTimeConflict = hasTimeOverlap(sessionStart, sessionEnd, scheduleStart, scheduleEnd);

          if (hasTimeConflict) {
            console.log('🔴 CONFLICT Teacher:', {
              teacherId,
              scheduleId: schedule._id || schedule.id,
              sessionDate: sessionDate,
              sessionTime: `${sessionStart} - ${sessionEnd}`,
              scheduleDate: scheduleDateStr,
              scheduleTime: `${scheduleStart} - ${scheduleEnd}`
            });
            conflicts.add(teacherId);
          }
        });
      });
    });

    console.log('📋 Conflicting Teacher IDs:', Array.from(conflicts));
    return conflicts;
  }, [generatedSessions, teacherSchedules]);

  const conflictingStudentIds = useMemo(() => {
    if (!generatedSessions.length || Object.keys(studentSchedules).length === 0) {
      return new Map();
    }

    const conflicts = new Map(); // Map<studentId, Array<conflictDetails>>

    // Check each student's schedules
    Object.entries(studentSchedules).forEach(([studentId, schedules]) => {
      if (!schedules || schedules.length === 0) return;

      const studentConflicts = [];

      // Check each generated session against student's schedules
      generatedSessions.forEach((session) => {
        const sessionDate = session.date;
        const sessionStart = parseTime(session.startTime);
        const sessionEnd = parseTime(session.endTime);

        schedules.forEach((schedule) => {
          // Get schedule date - handle different response formats
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate || schedule.classSchedule?.date;
          if (!scheduleDate) return;

          // Format schedule date to YYYY-MM-DD for comparison
          const scheduleDateStr = new Date(scheduleDate).toISOString().split('T')[0];

          // Check if dates match
          if (scheduleDateStr !== sessionDate) {
            return;
          }

          // Check time overlap - handle different response formats
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
            // Get class name - handle different response formats
            const className = 
              schedule.className || 
              schedule.class?.name || 
              schedule.classSchedule?.class?.name ||
              'N/A';
            
            // Format date for display
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

            console.log('🔴 CONFLICT Student:', {
              studentId,
              scheduleId: schedule._id || schedule.id || schedule.classSchedule?._id,
              className,
              sessionDate: sessionDate,
              sessionTime: `${sessionStart} - ${sessionEnd}`,
              scheduleDate: scheduleDateStr,
              scheduleTime: `${scheduleStart} - ${scheduleEnd}`
            });
          }
        });
      });

      if (studentConflicts.length > 0) {
        conflicts.set(studentId, studentConflicts);
      }
    });

    console.log('📋 Conflicting Student IDs:', Array.from(conflicts.keys()));
    return conflicts;
  }, [generatedSessions, studentSchedules]);

  const filteredRooms = useMemo(() => {
    if (!generatedSessions.length || !existingSchedules.length) {
      return rooms;
    }

    const filtered = rooms.filter(
      (room) => {
        // API có thể trả về _id (MongoDB) hoặc id
        const roomId = room._id || room.id;
        const roomIdStr = String(roomId);
        
        // Lấy roomName với nhiều fallback
        const roomName = room.name || room.roomName || room.room_name || room.title || `Phòng ${roomId}`;
        
        // So sánh bằng cả id và name
        const hasIdConflict = conflictingRoomIds.has(roomIdStr) || conflictingRoomIds.has(String(room.id));
        const hasNameConflict = conflictingRoomIds.has(roomName) || 
                                conflictingRoomIds.has(room.name) || 
                                conflictingRoomIds.has(room.roomName) || 
                                conflictingRoomIds.has(room.room_name);
        
        if (hasIdConflict || hasNameConflict) {
          console.log('🚫 Room filtered out:', {
            roomId,
            roomIdStr,
            roomName,
            hasIdConflict,
            hasNameConflict,
            conflictingIds: Array.from(conflictingRoomIds)
          });
        }
        
        return !hasIdConflict && !hasNameConflict;
      }
    );
    
    console.log('📋 Filtered rooms:', {
      total: rooms.length,
      filtered: filtered.length,
      conflicting: conflictingRoomIds.size,
      conflictingIds: Array.from(conflictingRoomIds)
    });
    
    return filtered;
  }, [generatedSessions, existingSchedules, rooms, conflictingRoomIds]);

  const filteredTeachers = useMemo(() => {
    // Nếu chưa có đủ thông tin để filter, hiển thị tất cả teachers
    if (!generatedSessions.length || Object.keys(teacherSchedules).length === 0) {
      console.log('📋 Showing all teachers (no filter conditions):', teachers.length);
      return teachers;
    }

    // Nếu có đủ thông tin, filter teachers có conflict
    const filtered = teachers.filter(
      (teacher) => {
        // API có thể trả về _id (MongoDB) hoặc id
        const teacherId = teacher._id || teacher.id;
        const teacherIdStr = String(teacherId);
        
        // Chỉ so sánh bằng ID (không so sánh bằng name vì name có thể trùng và không đáng tin cậy)
        const hasIdConflict = conflictingTeacherIds.has(teacherIdStr) || conflictingTeacherIds.has(String(teacher.id));
        
        return !hasIdConflict;
      }
    );
    
    console.log('📋 Filtered teachers:', {
      total: teachers.length,
      filtered: filtered.length,
      conflicting: conflictingTeacherIds.size
    });
    
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
    <Modal show={true} onHide={onClose} size="xl" centered backdrop="static">
      <Modal.Header closeButton className="bg-main-600 text-white border-0 p-24">
        <Modal.Title className="fw-bold">
          <i className="fas fa-plus-circle me-2"></i>
          Tạo lớp học mới
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-24" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Basic Information - Moved to top */}
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
                    Chương trình <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                    className="border-neutral-30 radius-8 px-16 py-10"
                  >
                    <option value="">-- Chọn chương trình --</option>
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
                    className="border-neutral-30 radius-8 px-16 py-10"
                  >
                    <option value="">-- Chọn cấp độ --</option>
                    {availableLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Band</Form.Label>
                  <Form.Control
                    type="text"
                    name="band"
                    value={formData.band}
                    onChange={handleInputChange}
                    placeholder="VD: Band 1"
                    className="border-neutral-30 radius-8 px-16 py-10"
                    readOnly
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-16">
              <div className="col-md-12">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Course <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.program || coursesLoading}
                    className="border-neutral-30 radius-8 px-16 py-10"
                  >
                    <option value="">
                      {!formData.program 
                        ? '-- Chọn chương trình trước --'
                        : coursesLoading 
                        ? 'Đang tải danh sách course...'
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
            </div>
          </div>

          {/* Schedule */}
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
            </div>

            <Form.Group className="mb-12">
              <Form.Label className="text-neutral-700 fw-medium mb-8">
                Thời khóa biểu <span className="text-danger-600">*</span>
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
                    <div className="fw-semibold text-neutral-900">
                      Buổi {index + 1}
                    </div>
                    {formData.scheduleEntries.length > 1 && (
                      <Button
                        type="button"
                        className="btn-outline-danger text-13 fw-medium px-14 py-6 radius-8"
                        onClick={() => removeScheduleEntry(entry.id)}
                      >
                        <i className="fas fa-trash-alt me-2"></i>
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

                    {/* Resources */}
                    <div className="mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Tài nguyên
            </h5>
            
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Giáo viên <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
                    disabled={teachers.length === 0}
                    required
                  >
                    <option value="">-- Chọn giáo viên --</option>
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
                      // Hỗ trợ nhiều format tên từ API
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
                    {teachers.length === 0
                      ? 'Đang tải danh sách giáo viên...'
                      : filteredTeachers.length === 0 && generatedSessions.length > 0
                      ? 'Không còn giáo viên phù hợp (tất cả đều bị trùng lịch)'
                      : generatedSessions.length > 0
                      ? `Có ${filteredTeachers.length} giáo viên phù hợp (chưa bị trùng lịch)`
                      : `Có ${teachers.length} giáo viên. Chọn course và lịch học để lọc giáo viên phù hợp.`}
                  </Form.Text>
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
                    disabled={roomLoading}
                  >
                    <option value="">
                      {roomLoading ? 'Đang kiểm tra phòng trống...' : '-- Chọn phòng học --'}
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
                    Chỉ hiển thị phòng chưa bị trùng với lịch đã chọn.
                  </Form.Text>
                  {roomError && (
                    <Alert variant="warning" className="mt-12 mb-0">
                      {roomError}
                    </Alert>
                  )}
                </Form.Group>
              </div>
            </div>
          </div>

          {/* Students Selection */}
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
                    className="text-13 fw-medium px-16 py-8 radius-8"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Thêm học viên
                  </Button>
                </div>
              </div>

              {/* Hidden file input */}
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
                      // Find student details from the students list
                      const student = students.find(s => {
                        const studentId = s._id || s.id;
                        return String(studentId) === String(selectedStudentId);
                      });
                      
                      if (!student) {
                        // If student not found in list, show placeholder
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

              <Form.Text className="text-neutral-500 text-12 mt-8">
                <i className="fas fa-info-circle me-1"></i>
                Có thể thêm học viên sau khi tạo lớp. File Excel cần có cột đầu tiên chứa Email hoặc Số điện thoại của học viên.
              </Form.Text>
              {conflictingStudentIds.size > 0 && (
                <Alert variant="warning" className="mt-12 mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Cảnh báo:</strong> Có {conflictingStudentIds.size} học viên bị trùng giờ học với lớp đang tạo. 
                  Vui lòng kiểm tra lại lịch học của các học viên này (xem chi tiết bên trên).
                </Alert>
              )}
            </div>
          </div>



        </Modal.Body>

        <Modal.Footer className="bg-neutral-25 border-0 p-20">
          <Button 
            className="btn-outline-neutral text-15 fw-medium px-20 py-10 radius-8"
            onClick={onClose}
          >
            <i className="fas fa-times me-2"></i> Hủy
          </Button>
          <Button 
            type="submit" 
            className="btn-main text-15 fw-semibold px-24 py-10 radius-8"
          >
            <i className="fas fa-check me-2"></i> Tạo lớp học
          </Button>
        </Modal.Footer>
      </Form>

      {/* Select Student Modal */}
      <SelectStudentModal
        show={showSelectStudentModal}
        onClose={() => setShowSelectStudentModal(false)}
        onConfirm={handleStudentsConfirmed}
        initialSelectedStudents={formData.selectedStudents}
        generatedSessions={generatedSessions}
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
                    Không tìm thấy {importResult.notFound.length} học viên:
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
    </Modal>
  );
};

export default CreateClassModal;
