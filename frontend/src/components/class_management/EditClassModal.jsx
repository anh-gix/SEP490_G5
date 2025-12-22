import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Container, Card, Modal, Button, Form, Alert, ButtonGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import classService from '../../services/classService';
import teacherService from '../../services/teacherService';
import roomService from '../../services/roomService';
import scheduleService from '../../services/scheduleService';
import studentService from '../../services/studentService';
import classScheduleService from '../../services/classScheduleService';
import courseService from '../../services/courseService';
import programService from '../../services/programService';
import SelectStudentModal from './SelectStudentModal';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleWeekly from './ScheduleWeekly';
import { formatDateToYYYYMMDD, parseDateString, formatDate } from '../../helper/helper';

const createEmptyScheduleEntry = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  day: '',
  startTime: '08:00',
  endTime: '10:00'
});

const EditClassForm = ({ classData, onSubmit, onDelete, classId, onBack }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
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
    tuitionFee: 0,
    status: 'disable'
  });

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [studentsFetched, setStudentsFetched] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [dateError, setDateError] = useState('');
  // Teacher and room conflict checking states (from backend)
  const [teacherRoomConflicts, setTeacherRoomConflicts] = useState({
    teacherConflicts: [],
    roomConflicts: [],
    conflictingTeacherIds: [],
    conflictingRoomIds: []
  });
  const [checkingTeacherRoomConflicts, setCheckingTeacherRoomConflicts] = useState(false);
  const [teacherSchedules, setTeacherSchedules] = useState({}); // Map teacherId -> schedules
  const [roomSchedules, setRoomSchedules] = useState({}); // Map roomId -> schedules
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [scheduleEntriesError, setScheduleEntriesError] = useState(null);
  const [duplicateEntryIndices, setDuplicateEntryIndices] = useState([]);
  const [fullClassData, setFullClassData] = useState(null); // Store full class data with schedules
  const [loadingClassData, setLoadingClassData] = useState(false); // Loading state for class data
  const [availablePrograms, setAvailablePrograms] = useState([]); // Programs for dropdown (type: IELTS, TOEIC, Cambridge)
  const [availableLevels, setAvailableLevels] = useState([]); // Levels for dropdown
  const [courses, setCourses] = useState([]); // Courses for dropdown
  const [allCourses, setAllCourses] = useState([]); // Tất cả courses
  const [coursesLoading, setCoursesLoading] = useState(false); // Loading state for courses
  const [allProgramsFromDB, setAllProgramsFromDB] = useState([]); // Tất cả programs từ bảng Program (program_name)
  const [filteredProgramsFromDB, setFilteredProgramsFromDB] = useState([]); // Programs được filter theo type và level
  const [calendarViewMode, setCalendarViewMode] = useState('month'); // 'month' or 'week'
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState(null); // Selected schedule for detail modal
  const [showScheduleDetailModal, setShowScheduleDetailModal] = useState(false); // Show/hide schedule detail modal
  const [editedSchedule, setEditedSchedule] = useState(null); // Edited schedule data
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false); // Show/hide add schedule modal
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // Show/hide confirmation modal for deleting schedules
  const [schedulesToDelete, setSchedulesToDelete] = useState([]); // Schedules that will be deleted
  const [newScheduleData, setNewScheduleData] = useState({
    day: '',
    startTime: '08:00',
    endTime: '10:00',
    repeatWeekly: false
  });
  const [savingSchedule, setSavingSchedule] = useState(false); // Loading state for saving schedule
  const [validationResult, setValidationResult] = useState(null); // Validation result for new schedule
  const [validatingSchedule, setValidatingSchedule] = useState(false); // Loading state for validation
  const [pendingScheduleData, setPendingScheduleData] = useState(null); // Store schedule data while waiting for confirmation
  const [hasAttendance, setHasAttendance] = useState(false); // Check if schedule has attendance (buổi đã học)
  const [checkingAttendance, setCheckingAttendance] = useState(false); // Loading state for checking attendance
  const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false); // Show/hide confirm update modal
  const [updateScope, setUpdateScope] = useState('single'); // 'single' or 'future' - scope of update
  const [schedulesAttendanceMap, setSchedulesAttendanceMap] = useState(new Map()); // Map<scheduleId, hasAttendance>
  
  // Schedule validation states for "Thông tin buổi học" modal
  const [scheduleValidationResult, setScheduleValidationResult] = useState(null); // Validation result for schedule edit
  const [validatingScheduleEdit, setValidatingScheduleEdit] = useState(false); // Loading state for schedule edit validation

  // Check if the edited schedule is in the past
  const isPastSchedule = useMemo(() => {
    if (!editedSchedule?.date) return false;
    const scheduleDate = new Date(editedSchedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduleDate < today;
  }, [editedSchedule?.date]);

  // Check if schedule has been modified
  const hasScheduleChanges = useMemo(() => {
    if (!editedSchedule || !selectedScheduleDetail) return false;

    // Get original roomId from selectedScheduleDetail
    const originalRoomId = selectedScheduleDetail.roomId || selectedScheduleDetail.room?._id || selectedScheduleDetail.room?.id;

    // Compare all fields
    return (
      editedSchedule.date !== selectedScheduleDetail.date ||
      editedSchedule.startTime !== selectedScheduleDetail.startTime ||
      editedSchedule.endTime !== selectedScheduleDetail.endTime ||
      editedSchedule.roomId !== originalRoomId
    );
  }, [editedSchedule, selectedScheduleDetail]);

  // Validation states for "Xác nhận chỉnh sửa" modal
  const [confirmUpdateValidationResult, setConfirmUpdateValidationResult] = useState(null); // Validation result for confirm update modal
  const [validatingConfirmUpdate, setValidatingConfirmUpdate] = useState(false); // Loading state for confirm update validation
  
  // Pending schedule changes (temporary changes not yet saved to database)
  const [pendingScheduleChanges, setPendingScheduleChanges] = useState([]); // Array<{ scheduleId, oldSchedule: {date, startTime, endTime}, newSchedule: {date, startTime, endTime}, updateScope: 'single'|'future', matchingScheduleIds?: string[] }>

  // Track initial startDate to detect changes
  const [initialStartDate, setInitialStartDate] = useState(null);
  
  // Student selection and Excel import states
  const [selectedStudents, setSelectedStudents] = useState([]); // Array of student IDs
  const [showSelectStudentModal, setShowSelectStudentModal] = useState(false);
  const [importingExcel, setImportingExcel] = useState(false);
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [students, setStudents] = useState([]); // All students for Excel matching
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(null);
  const [capacityWarning, setCapacityWarning] = useState(null);
  const fileInputRef = useRef(null);
  
  // Student conflict checking states
  const [studentSchedules, setStudentSchedules] = useState({}); // Map<studentId, schedules[]>
  const [studentConflicts, setStudentConflicts] = useState(new Map()); // Map<studentId, conflictDetails[]>
  const [checkingStudentConflicts, setCheckingStudentConflicts] = useState(false);
  
  // Track previous program and level to detect actual changes
  const prevProgramRef = useRef(null);
  const prevLevelRef = useRef(null);

  // Fetch full class data with schedules when modal opens
  useEffect(() => {
    const fetchFullClassData = async () => {
      if (!classData || (!classData.id && !classData._id)) {
        setFullClassData(null);
        return;
      }

      const classId = classData.id || classData._id;

      try {
        setLoadingClassData(true);
        const response = await classService.getClassById(classId);
        
        // Handle different response formats
        let classDataWithSchedules = null;
        if (response && response.success && response.class) {
          classDataWithSchedules = response.class;
        } else if (response && response.data) {
          classDataWithSchedules = response.data;
        } else if (response && response.class) {
          classDataWithSchedules = response.class;
        } else {
          classDataWithSchedules = classData; // Fallback to classData prop
        }
        
        setFullClassData(classDataWithSchedules);

      } catch (error) {
        console.error('Error fetching full class data:', error);
        setFullClassData(classData); // Fallback to classData prop on error
      } finally {
        setLoadingClassData(false);
      }
    };

    fetchFullClassData();
  }, [classData?.id, classData?._id]);

  useEffect(() => {
    // Reset studentsFetched when classData changes
    setStudentsFetched(false);
    
    // Use fullClassData if available (has schedules), otherwise use classData prop
    const dataToUse = fullClassData || classData;
    
    if (dataToUse) {
      // Convert schedule to scheduleEntries format
      let scheduleEntries = [createEmptyScheduleEntry()];
      
      // Try to parse from schedules array first (more accurate)
      if (dataToUse.schedules && Array.isArray(dataToUse.schedules) && dataToUse.schedules.length > 0) {
        // Group schedules by day and time to create scheduleEntries
        const scheduleMap = new Map();
        
        dataToUse.schedules.forEach(schedule => {
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
          if (!scheduleDate) {
            return;
          }
          
          const date = new Date(scheduleDate);
          if (isNaN(date.getTime())) {
            return;
          }
          
          const dayOfWeek = date.getDay();
          const dayMap = { 0: 'CN', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7' };
          const day = dayMap[dayOfWeek];
          
          const startTime = schedule.startTime || schedule.start_time || '08:00';
          const endTime = schedule.endTime || schedule.end_time || '10:00';
          
          const key = `${day}-${startTime}-${endTime}`;
          if (!scheduleMap.has(key)) {
            scheduleMap.set(key, { day, startTime, endTime });
          }
        });
        
        scheduleEntries = Array.from(scheduleMap.values()).map(entry => ({
          ...createEmptyScheduleEntry(),
          ...entry
        }));
      } else if (dataToUse.schedule && typeof dataToUse.schedule === 'string') {
        // Fallback: Parse schedule string to extract days and time
        const scheduleMatch = dataToUse.schedule.match(/T([2-7]|CN)-?([2-7]|CN)?-?([2-7]|CN)?, (\d{2}:\d{2})-(\d{2}:\d{2})/);
        
        if (scheduleMatch) {
          const days = scheduleMatch.slice(1, 4).filter(Boolean);
          const startTime = scheduleMatch[4];
          const endTime = scheduleMatch[5];
          
          // Create one scheduleEntry for each day with the same time
          scheduleEntries = days.map(day => ({
            ...createEmptyScheduleEntry(),
            day,
            startTime,
            endTime
          }));
        }
      }
      
      // Ensure at least one entry
      if (scheduleEntries.length === 0) {
        scheduleEntries = [createEmptyScheduleEntry()];
      }

      // Handle course - check multiple possible field names
      const courseId = 
        dataToUse.course?._id || 
        dataToUse.course?.id || 
        dataToUse.course ||
        dataToUse.courseId ||
        dataToUse.course_id ||
        dataToUse.Course?._id ||
        dataToUse.Course?.id ||
        dataToUse.Course ||
        dataToUse.CourseId ||
        '';
      // Convert to string to ensure consistent comparison
      const courseIdStr = courseId ? String(courseId) : '';

      // Format startDate and endDate to YYYY-MM-DD format if they exist
      let formattedStartDate = '';
      let formattedEndDate = '';
      
      if (dataToUse.startDate) {
        formattedStartDate = formatDateToYYYYMMDD(dataToUse.startDate);
      }
      
      if (dataToUse.endDate) {
        formattedEndDate = formatDateToYYYYMMDD(dataToUse.endDate);
      }


      // Extract teacherId - handle both object and ID formats
      // Priority: teacher._id (from populated data, most accurate) > teacherId field > teacher string
      const teacherId = 
        (dataToUse.teacher?._id ? String(dataToUse.teacher._id) : '') ||
        (dataToUse.teacher?.id ? String(dataToUse.teacher.id) : '') ||
        dataToUse.teacherId ||
        (typeof dataToUse.teacher === 'string' ? String(dataToUse.teacher) : '') ||
        '';

      // Extract roomId - handle both object and ID formats
      const roomId = 
        dataToUse.roomId ||
        (dataToUse.room?._id ? String(dataToUse.room._id) : '') ||
        (dataToUse.room?.id ? String(dataToUse.room.id) : '') ||
        (typeof dataToUse.room === 'string' ? String(dataToUse.room) : '') ||
        '';

      // Extract programId - handle both object and ID formats
      const programId = 
        dataToUse.programId ||
        (dataToUse.course?.program?._id ? String(dataToUse.course.program._id) : '') ||
        (dataToUse.course?.program?.id ? String(dataToUse.course.program.id) : '') ||
        (typeof dataToUse.course?.program === 'string' ? String(dataToUse.course.program) : '') ||
        '';

      // Extract program TYPE (ielts, toeic, cam) - NOT program name
      // IMPORTANT: We store TYPE in formData, not program name
      // Type should come from course.program.type
      const programType = 
        dataToUse.course?.program?.type ||  // First priority: type from populated program
        (dataToUse.programName ? (() => {
          // Convert programName to type if available
          const typeMap = {
            'IELTS': 'ielts',
            'TOEIC': 'toeic',
            'Cambridge': 'cam'
          };
          return typeMap[dataToUse.programName] || '';
        })() : '') ||
        (dataToUse.program ? (() => {
          // Check if dataToUse.program is a type (ielts, toeic, cam)
          const validTypes = ['ielts', 'toeic', 'cam'];
          if (validTypes.includes(dataToUse.program.toLowerCase())) {
            return dataToUse.program.toLowerCase();
          }
          // If it's a program name, convert to type
          const typeMap = {
            'IELTS': 'ielts',
            'TOEIC': 'toeic',
            'Cambridge': 'cam'
          };
          return typeMap[dataToUse.program] || '';
        })() : '') ||
        '';


      // Ensure id is set correctly (use id or _id)
      const classId = dataToUse.id || dataToUse._id || '';

      // Reset refs when loading new class data
      prevProgramRef.current = null;
      prevLevelRef.current = null;

      const startDateValue = formattedStartDate || dataToUse.startDate || '';

      setFormData({
        ...dataToUse,
        id: classId, // Explicitly set id to ensure it's available
        course: courseIdStr,
        program: programType || '', // Store TYPE (ielts, toeic, cam), not program name
        programId: programId, // Set programId from course.program or dataToUse.programId
        band: dataToUse.band || dataToUse.course?.program?.band || '', // Get band from dataToUse or course.program.band
        startDate: startDateValue,
        endDate: formattedEndDate || dataToUse.endDate || '',
        scheduleEntries,
        teacherId: teacherId, // Explicitly set teacherId
        roomId: roomId // Explicitly set roomId
      });

      // Save initial startDate for comparison
      setInitialStartDate(startDateValue);

      // Load students from dataToUse - check multiple possible field names
      let studentsData = null;
      
      if (dataToUse.students && Array.isArray(dataToUse.students)) {
        studentsData = dataToUse.students;
      } else if (dataToUse.Students && Array.isArray(dataToUse.Students)) {
        studentsData = dataToUse.Students;
      } else if (dataToUse.studentList && Array.isArray(dataToUse.studentList)) {
        studentsData = dataToUse.studentList;
      } else if (dataToUse.members && Array.isArray(dataToUse.members)) {
        studentsData = dataToUse.members;
      } else {
        studentsData = null; // Set to null to trigger API fetch
      }
      
      if (studentsData !== null) {
        setClassStudents(studentsData);
        setStudentsFetched(true); // Mark as fetched
      } else {
        // Reset flag to allow API fetch
        setStudentsFetched(false);
        setClassStudents([]); // Set empty array first
      }
    }
  }, [classData, fullClassData]);

  // Validate schedule conflicts when user changes schedule data
  useEffect(() => {
    const validateSchedule = async () => {
      // Only validate if modal is open and all required fields are filled
      if (!showAddScheduleModal || !newScheduleData.day || !newScheduleData.startTime || !newScheduleData.endTime) {
        setValidationResult(null);
        return;
      }

      const classId = formData.id || formData._id;
      if (!classId) {
        setValidationResult(null);
        return;
      }

      const roomId = formData.roomId || fullClassData?.room?._id || fullClassData?.room?.id;
      if (!roomId) {
        setValidationResult(null);
        return;
      }

      // Convert day to date
      const today = new Date();
      const dayMap = { 'CN': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6 };
      const targetDay = dayMap[newScheduleData.day];
      
      let daysToAdd = (targetDay - today.getDay() + 7) % 7;
      if (daysToAdd === 0) daysToAdd = 7;
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + daysToAdd);
      scheduleDate.setHours(0, 0, 0, 0);

      // Format date để tránh timezone issues (dùng local time, không dùng UTC)
      const year = scheduleDate.getFullYear();
      const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduleDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      try {
        setValidatingSchedule(true);
        const response = await classScheduleService.validateAddClassSchedule({
          classId: classId,
          date: dateString, // Dùng local time thay vì UTC
          startTime: newScheduleData.startTime,
          endTime: newScheduleData.endTime,
          room: roomId
        });

        setValidationResult(response);
      } catch (error) {
        console.error('Error validating schedule:', error);
        setValidationResult({
          success: false,
          conflicts: { hasConflict: false },
          message: 'Không thể kiểm tra xung đột lịch học'
        });
      } finally {
        setValidatingSchedule(false);
      }
    };

    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(() => {
      validateSchedule();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [showAddScheduleModal, newScheduleData.day, newScheduleData.startTime, newScheduleData.endTime, formData.id, formData._id, formData.roomId, fullClassData?.room]);

  // Validate schedule conflicts when editing schedule in "Thông tin buổi học" modal
  useEffect(() => {
    const validateScheduleEdit = async () => {
      // Only validate if modal is open and all required fields are filled
      if (!showScheduleDetailModal || !editedSchedule || !editedSchedule.date || !editedSchedule.startTime || !editedSchedule.endTime) {
        setScheduleValidationResult(null);
        return;
      }

      // Don't validate if has attendance (can't edit anyway)
      if (hasAttendance) {
        setScheduleValidationResult(null);
        return;
      }

      // Don't validate if schedule is in the past
      if (isPastSchedule) {
        setScheduleValidationResult(null);
        return;
      }

      const classId = formData.id || formData._id;
      if (!classId) {
        setScheduleValidationResult(null);
        return;
      }

      // Get roomId from editedSchedule (user's current selection) or fallback
      let roomId = editedSchedule?.roomId;

      // If no roomId in editedSchedule, try to get from original schedule data
      if (!roomId && selectedScheduleDetail?.id && fullClassData?.schedules) {
        const originalSchedule = fullClassData.schedules.find(s => {
          const scheduleId = s._id || s.id;
          return String(scheduleId) === String(selectedScheduleDetail.id);
        });
        if (originalSchedule) {
          roomId = originalSchedule.room?._id || originalSchedule.room?.id || originalSchedule.room;
        }
      }

      // Fallback to formData or fullClassData
      if (!roomId) {
        roomId = selectedScheduleDetail?.roomId ||
                 selectedScheduleDetail?.room?._id ||
                 selectedScheduleDetail?.room?.id ||
                 formData.roomId ||
                 fullClassData?.room?._id ||
                 fullClassData?.room?.id;
      }

      if (!roomId) {
        setScheduleValidationResult(null);
        return;
      }

      // Get scheduleId to exclude from validation (for update mode)
      const scheduleId = selectedScheduleDetail?.id || selectedScheduleDetail?._id;
      const excludeScheduleId = scheduleId && !scheduleId.startsWith('generated-') && !scheduleId.startsWith('schedule-') 
        ? scheduleId 
        : null;

      try {
        setValidatingScheduleEdit(true);
        
        const validationData = {
          classId: classId,
          date: editedSchedule.date,
          startTime: editedSchedule.startTime,
          endTime: editedSchedule.endTime,
          room: roomId,
          excludeScheduleId: excludeScheduleId
        };
        
        const response = await classScheduleService.validateAddClassSchedule(validationData);
        
        setScheduleValidationResult(response);
      } catch (error) {
        console.error(' Error validating schedule edit:', error);
        console.error('  - Error message:', error.message);
        console.error('  - Error response:', error.response?.data);
        setScheduleValidationResult({
          success: false,
          conflicts: { hasConflict: false },
          message: 'Không thể kiểm tra xung đột lịch học'
        });
      } finally {
        setValidatingScheduleEdit(false);
      }
    };

    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(() => {
      validateScheduleEdit();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [showScheduleDetailModal, editedSchedule?.date, editedSchedule?.startTime, editedSchedule?.endTime, editedSchedule?.roomId,
      formData.id, formData._id, formData.roomId, fullClassData?.room, selectedScheduleDetail, hasAttendance, isPastSchedule]);

  // Initialize selectedStudents from classStudents
  useEffect(() => {
    if (classStudents.length > 0) {
      const studentIds = classStudents.map(student => {
        const studentId = student._id || student.id;
        return String(studentId);
      }).filter(Boolean);
      setSelectedStudents(studentIds);
    } else {
      setSelectedStudents([]);
    }
  }, [classStudents]);

  // Fetch students from API if not found in classData
  useEffect(() => {
    const fetchStudentsFromAPI = async () => {
      if (!classData || (!classData.id && !classData._id)) {
        return;
      }

      // Skip if already fetched or if students are already in classData
      if (studentsFetched) {
        return;
      }

      if (classData.students && Array.isArray(classData.students) && classData.students.length > 0) {
        return;
      }

      const classId = classData.id || classData._id;

      try {
        const response = await classService.getClassById(classId);

        if (response && response.success && response.class) {
          const fullClassData = response.class;

          if (fullClassData.students && Array.isArray(fullClassData.students)) {
            setClassStudents(fullClassData.students);
            setStudentsFetched(true); // Mark as fetched
          } else {
            setClassStudents([]);
            setStudentsFetched(true); // Mark as fetched even if empty
          }
        } else {
          setClassStudents([]);
          setStudentsFetched(true); // Mark as fetched even if error
        }
      } catch (error) {
        setClassStudents([]);
        setStudentsFetched(true); // Mark as fetched even if error
      }
    };

    fetchStudentsFromAPI();
  }, [classData?.id, classData?._id, studentsFetched]);

  // Fetch teachers from API
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

  // Fetch all students for Excel import matching
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

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getAllRooms();

        if (response && (response.rooms || response.data)) {
          const fetchedRooms = response.rooms || response.data || [];
          // Only show rooms with status 'available'
          const availableRooms = fetchedRooms.filter(room => room.status === 'available');
          setRooms(availableRooms);
        } else {
          setRooms([]);
        }
      } catch (error) {
        setRooms([]);
      }
    };

    fetchRooms();
  }, []);


  // Helper functions for conflict checking (same as CreateClassModal)
  // These must be defined before useMemo hooks that use them
  const parseTime = (time) => {
    if (!time) return null;
    return time.length === 5 ? time : time.slice(0, 5);
  };

  const hasTimeOverlap = (startA, endA, startB, endB) => {
    if (!startA || !endA || !startB || !endB) return false;
    
    // Chuyển đổi thời gian từ string "HH:MM" sang phút để so sánh chính xác
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
    
    // Hai khoảng thời gian overlap nếu: startA < endB VÀ endA > startB
    // Lưu ý: Nếu một lớp kết thúc đúng lúc lớp kia bắt đầu (ví dụ: 08:00-10:00 và 10:00-12:00)
    // thì KHÔNG có overlap vì sử dụng > và < (không có =)
    return startAMin < endBMin && endAMin > startBMin;
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
    
    // Find first occurrences of each day of week from start date
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
        date: formatDateToYYYYMMDD(sessionDate), // Format as YYYY-MM-DD (local timezone)
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

  // Filter filled schedule entries
  const filledScheduleEntries = useMemo(
    () =>
      formData.scheduleEntries.filter(
        (entry) => entry.day && entry.startTime && entry.endTime
      ),
    [formData.scheduleEntries]
  );

  // Generate sessions that will be created
  // Priority: generated from scheduleEntries (when user edits) > fullClassData.schedules (initial load)
  const generatedSessions = useMemo(() => {
    // PRIORITY 1: Generate from scheduleEntries if we have startDate and filled scheduleEntries
    // This takes priority because user may have edited the schedule
    if (formData.startDate && filledScheduleEntries.length > 0) {
      // If numberOfSessions is available, use it
      if (selectedCourse?.numberOfSessions) {
        const generated = generateSessions(formData.startDate, filledScheduleEntries, selectedCourse.numberOfSessions);
        if (generated.length > 0) {
          return generated;
        }
      }
      
      // Fallback: Estimate sessions (about 12 sessions = 3 months)
      const estimatedSessions = 12;
      const generated = generateSessions(formData.startDate, filledScheduleEntries, estimatedSessions);
      if (generated.length > 0) {
        return generated;
      }
    }

    // PRIORITY 2: Fallback to existing schedules from database if we can't generate yet
    // Use fullClassData if available (has schedules), otherwise fallback to classData
    const dataSource = fullClassData || classData;
    
    if (dataSource?.schedules && Array.isArray(dataSource.schedules) && dataSource.schedules.length > 0) {
      const sessionsFromSchedules = dataSource.schedules
        .filter(schedule => {
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
          return scheduleDate && schedule.startTime && schedule.endTime;
        })
        .map(schedule => {
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
          if (!scheduleDate) return null;
          
          const dateStr = formatDateToYYYYMMDD(scheduleDate);
          if (!dateStr) return null;
          
          const date = parseDateString(dateStr);
          if (!date || isNaN(date.getTime())) return null;
          
          return {
            date: dateStr, // Format as YYYY-MM-DD (local timezone)
            dayOfWeek: date.getDay(),
            startTime: schedule.startTime || schedule.start_time || '08:00',
            endTime: schedule.endTime || schedule.end_time || '10:00'
          };
        })
        .filter(Boolean) // Remove null entries
        .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date
      
      if (sessionsFromSchedules.length > 0) {
        return sessionsFromSchedules;
      }
    }

    // If we can't generate sessions yet, return empty array
    return [];
  }, [formData.startDate, filledScheduleEntries, selectedCourse?.numberOfSessions, fullClassData?.schedules, classData?.schedules]);

  // Merge generatedSessions with pendingScheduleChanges to get effective sessions
  const effectiveGeneratedSessions = useMemo(() => {
    if (!pendingScheduleChanges || pendingScheduleChanges.length === 0) {
      return generatedSessions;
    }

    // Create a copy of generatedSessions
    const updatedSessions = [...generatedSessions];

    // Process each pending change
    pendingScheduleChanges.forEach(change => {
      if (change.updateScope === 'single') {
        // For single update, find and replace the matching session
        const oldDate = change.oldSchedule.date;
        const oldStartTime = change.oldSchedule.startTime;
        const oldEndTime = change.oldSchedule.endTime;

        // Find the session to replace
        const sessionIndex = updatedSessions.findIndex(session => 
          session.date === oldDate &&
          session.startTime === oldStartTime &&
          session.endTime === oldEndTime
        );

        if (sessionIndex !== -1) {
          // Replace with new schedule
          updatedSessions[sessionIndex] = {
            ...updatedSessions[sessionIndex],
            date: change.newSchedule.date,
            startTime: change.newSchedule.startTime,
            endTime: change.newSchedule.endTime
          };
        }
      } else if (change.updateScope === 'future') {
        // For future updates, we need to replace all matching sessions
        // Match by oldSchedule date, startTime, and endTime
        const oldDate = change.oldSchedule.date;
        const oldStartTime = change.oldSchedule.startTime;
        const oldEndTime = change.oldSchedule.endTime;
        const newStartTime = change.newSchedule.startTime;
        const newEndTime = change.newSchedule.endTime;

        // Parse dates
        const oldDateObj = new Date(oldDate);
        oldDateObj.setHours(0, 0, 0, 0);
        const newDateObj = new Date(change.newSchedule.date);
        newDateObj.setHours(0, 0, 0, 0);

        // Find all sessions that match the pattern (same day of week, time, and date >= oldDate)
        updatedSessions.forEach((session, index) => {
          // Check if this session matches the pattern
          const sessionDate = new Date(session.date);
          sessionDate.setHours(0, 0, 0, 0);
          
          // Match by day of week, time, and date >= oldDate
          if (sessionDate.getDay() === oldDateObj.getDay() &&
              session.startTime === oldStartTime &&
              session.endTime === oldEndTime &&
              sessionDate >= oldDateObj) {
            
            // Calculate number of weeks between this session and the first session
            const diffMs = sessionDate - oldDateObj;
            const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
            
            // Create new date: new date of first session + (number of weeks × 7 days)
            const targetDate = new Date(newDateObj);
            targetDate.setDate(targetDate.getDate() + (diffWeeks * 7));
            
            // Format date to YYYY-MM-DD
            const year = targetDate.getFullYear();
            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
            const day = String(targetDate.getDate()).padStart(2, '0');
            const newDateStr = `${year}-${month}-${day}`;

            // Replace with new schedule
            updatedSessions[index] = {
              ...updatedSessions[index],
              date: newDateStr,
              startTime: newStartTime,
              endTime: newEndTime
            };
          }
        });
      }
    });

    return updatedSessions;
  }, [generatedSessions, pendingScheduleChanges]);

  // Fetch teacher schedules for all teachers to check conflicts
  useEffect(() => {
    const fetchTeacherSchedules = async () => {
      if (!effectiveGeneratedSessions.length || !teachers.length) {
        setTeacherSchedules({});
        return;
      }

      const schedulesMap = {};
      
      const sessionDates = effectiveGeneratedSessions.map(s => s.date).sort();
      const minDate = sessionDates[0];
      const maxDate = sessionDates[sessionDates.length - 1];

      await Promise.all(
        teachers.map(async (teacher) => {
          const teacherId = teacher._id || teacher.id;
          if (!teacherId) return;

          try {
            // Fetch ALL schedules (không giới hạn date range) để hiển thị đầy đủ
            const response = await teacherService.getTeacherSchedule(teacherId, {});

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
  }, [teachers, effectiveGeneratedSessions, formData.teacherId]);

  // Fetch room schedules for all rooms to check conflicts
  useEffect(() => {
    const fetchRoomSchedules = async () => {
      if (!effectiveGeneratedSessions.length || !rooms.length) {
        setRoomSchedules({});
        return;
      }

      const schedulesMap = {};
      
      const sessionDates = effectiveGeneratedSessions.map(s => s.date).sort();
      const minDate = sessionDates[0];
      const maxDate = sessionDates[sessionDates.length - 1];

      await Promise.all(
        rooms.map(async (room) => {
          const roomId = room._id || room.id;
          if (!roomId) return;

          try {
            const response = await roomService.getRoomSchedule(roomId, {
              startDate: minDate,
              endDate: maxDate
            });

            if (response && response.schedules) {
              schedulesMap[String(roomId)] = response.schedules;
            }
          } catch (error) {
            schedulesMap[String(roomId)] = [];
          }
        })
      );

      setRoomSchedules(schedulesMap);
    };

    fetchRoomSchedules();
  }, [rooms, effectiveGeneratedSessions]);

  // Calculate conflicting teacher IDs for all teachers based on effectiveGeneratedSessions
  const conflictingTeacherIds = useMemo(() => {
    if (!effectiveGeneratedSessions.length || Object.keys(teacherSchedules).length === 0) {
      return new Set();
    }

    const conflicts = new Set();

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

    // Helper function to format date to YYYY-MM-DD
    const formatDateToYYYYMMDD = (dateInput) => {
      if (!dateInput) return null;
      
      // If already in YYYY-MM-DD format, return as is
      if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
      }
      
      // If in DD/MM/YYYY format, convert to YYYY-MM-DD
      if (typeof dateInput === 'string' && dateInput.includes('/')) {
        const [day, month, year] = dateInput.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Try parsing as Date object
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return null;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Get current class ID as string for comparison
    const currentClassIdStr = String(formData.id || formData._id || '');

    Object.entries(teacherSchedules).forEach(([teacherId, schedules]) => {
      if (!schedules || schedules.length === 0) return;

      effectiveGeneratedSessions.forEach((session) => {
        const sessionDate = session.date;
        const sessionStart = parseTime(session.startTime);
        const sessionEnd = parseTime(session.endTime);

        schedules.forEach((schedule) => {
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
          if (!scheduleDate) return;

          // Skip if it's from the current class
          const scheduleClassId = schedule.class?._id?.toString() || 
                                 schedule.classId?.toString() || 
                                 schedule.class?.id?.toString();
          if (scheduleClassId && scheduleClassId === currentClassIdStr) {
            return;
          }

          // Parse and normalize date to YYYY-MM-DD format
          const normalizedScheduleDate = formatDateToYYYYMMDD(scheduleDate);
          if (!normalizedScheduleDate || normalizedScheduleDate !== sessionDate) {
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
  }, [effectiveGeneratedSessions, teacherSchedules, formData.id, formData._id]);

  // Calculate conflicting room IDs for all rooms based on effectiveGeneratedSessions
  const conflictingRoomIds = useMemo(() => {
    if (!effectiveGeneratedSessions.length || Object.keys(roomSchedules).length === 0) {
      return new Set();
    }

    const conflicts = new Set();

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

    // Helper function to format date to YYYY-MM-DD
    const formatDateToYYYYMMDD = (dateInput) => {
      if (!dateInput) return null;
      
      // If already in YYYY-MM-DD format, return as is
      if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
      }
      
      // If in DD/MM/YYYY format, convert to YYYY-MM-DD
      if (typeof dateInput === 'string' && dateInput.includes('/')) {
        const [day, month, year] = dateInput.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Try parsing as Date object
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return null;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Get current class ID as string for comparison
    const currentClassIdStr = String(formData.id || formData._id || '');

    Object.entries(roomSchedules).forEach(([roomId, schedules]) => {
      if (!schedules || schedules.length === 0) return;

      effectiveGeneratedSessions.forEach((session) => {
        const sessionDate = session.date;
        const sessionStart = parseTime(session.startTime);
        const sessionEnd = parseTime(session.endTime);

        schedules.forEach((schedule) => {
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
          if (!scheduleDate) return;

          // Skip if it's from the current class
          const scheduleClassId = schedule.class?._id?.toString() || 
                                 schedule.classId?.toString() || 
                                 schedule.class?.id?.toString();
          if (scheduleClassId && scheduleClassId === currentClassIdStr) {
            return;
          }

          // Parse and normalize date to YYYY-MM-DD format
          const normalizedScheduleDate = formatDateToYYYYMMDD(scheduleDate);
          if (!normalizedScheduleDate || normalizedScheduleDate !== sessionDate) {
            return;
          }

          const scheduleStart = parseTime(schedule.startTime);
          const scheduleEnd = parseTime(schedule.endTime);
          const hasTimeConflict = hasTimeOverlap(sessionStart, sessionEnd, scheduleStart, scheduleEnd);

          if (hasTimeConflict) {
            conflicts.add(roomId);
          }
        });
      });
    });

    return conflicts;
  }, [effectiveGeneratedSessions, roomSchedules, formData.id, formData._id]);

  // Log teacher schedule and compare with current class schedule when teacher is selected
  useEffect(() => {
    const logAndCompareSchedules = async () => {
      const teacherId = formData.teacherId || (fullClassData?.teacher?._id || fullClassData?.teacher?.id);
      const classId = formData.id || formData._id;
      
      // Clear teacher conflicts immediately when teacher changes (before checking new teacher)
      setTeacherRoomConflicts(prev => ({
        ...prev,
        teacherConflicts: [],
        conflictingTeacherIds: []
      }));

      if (!teacherId || !classId) {
        return;
      }

      try {
        // Get date range from generated sessions if available
        let params = {};
        if (generatedSessions.length > 0) {
          const sessionDates = generatedSessions.map(s => s.date).sort();
          params = {
            startDate: sessionDates[0],
            endDate: sessionDates[sessionDates.length - 1]
          };
        }

        // Get teacher schedule
        const teacherResponse = await teacherService.getTeacherSchedule(teacherId, params);
        
        // Helper function to format date to YYYY-MM-DD using local timezone (not UTC)
        const formatDateLocal = (dateInput) => {
          if (!dateInput) return null;
          const date = new Date(dateInput);
          if (isNaN(date.getTime())) return null;
          
          // Use local timezone, not UTC
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        // Get current class schedules
        const classSchedules = fullClassData?.schedules || [];
        const currentClassSchedules = classSchedules
          .filter(s => s.date && s.startTime && s.endTime)
          .map(s => {
            const scheduleDate = s.date || s.scheduleDate || s.classDate;
            return {
              date: formatDateLocal(scheduleDate),
              startTime: s.startTime || s.start_time,
              endTime: s.endTime || s.end_time,
              className: fullClassData?.name || 'Lớp hiện tại',
              room: s.room?.room_name || s.room?.name || 'N/A',
              status: s.status || 'fixed'
            };
          })
          .filter(s => s.date); // Remove invalid dates

        // Log teacher schedule
        if (teacherResponse && teacherResponse.schedules) {
          // Helper function to format date to YYYY-MM-DD using local timezone (not UTC)
          const formatDateLocal = (dateInput) => {
            if (!dateInput) return null;
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return null;
            
            // Use local timezone, not UTC
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          // Get class IDs from teacher schedules to filter out current class
          const teacherSchedules = teacherResponse.schedules.map(schedule => {
            // Try to get classId from various possible fields
            const scheduleClassId = schedule.class?._id?.toString() || 
                                   schedule.classId?.toString() || 
                                   schedule.class?.id?.toString() ||
                                   schedule._id?.toString(); // Fallback to schedule ID if class info not available
            
            return {
              date: formatDateLocal(schedule.date),
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              className: schedule.className || schedule.class?.name || 'N/A',
              classId: scheduleClassId,
              room: schedule.room?.room_name || schedule.room?.name || 'N/A',
              status: schedule.status,
              _id: schedule._id
            };
          }).filter(s => s.date);

          // Check which teacher schedules have attendance (already taught)
          // Get schedule IDs from teacher schedules
          const teacherScheduleIds = teacherSchedules
            .filter(s => s._id && !s._id.toString().startsWith('generated-'))
            .map(s => s._id.toString());
          
          let scheduleIdsWithAttendance = new Set();
          // Skip attendance check if too many schedules (performance optimization)
          // Backend already filters attendance, so this is just for frontend display
          if (teacherScheduleIds.length > 0 && teacherScheduleIds.length <= 50) {
            try {
              // Check attendance for all teacher schedules in parallel with timeout
              // Batch requests to avoid overwhelming the server
              const BATCH_SIZE = 5;
              const attendanceChecks = [];
              
              for (let i = 0; i < teacherScheduleIds.length; i += BATCH_SIZE) {
                const batch = teacherScheduleIds.slice(i, i + BATCH_SIZE);
                const batchResults = await Promise.allSettled(
                  batch.map(async (scheduleId) => {
                    try {
                      // Add timeout to prevent hanging (increased to 5s)
                      const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 5000)
                      );
                      
                      const responsePromise = classScheduleService.getAttendanceByClassSchedule(scheduleId);
                      const response = await Promise.race([responsePromise, timeoutPromise]);
                      
                      const attendances = response?.list || response?.attendances || (Array.isArray(response) ? response : []) || [];
                      // Check if any student has attendance (status is not null/undefined)
                      const hasAnyAttendance = attendances.some(att => att?.attendance?.status != null);
                      return hasAnyAttendance ? scheduleId : null;
                    } catch (error) {
                      // If error checking, assume no attendance (safer to show conflict)
                      // Only log if it's not a timeout (to reduce noise)
                      if (!error.message?.includes('Timeout')) {
                        console.warn(`Warning: Could not check attendance for schedule ${scheduleId}:`, error.message);
                      }
                      return null;
                    }
                  })
                );
                attendanceChecks.push(...batchResults);
              }
              
              scheduleIdsWithAttendance = new Set(
                attendanceChecks
                  .filter(result => result.status === 'fulfilled' && result.value !== null)
                  .map(result => result.value)
              );
            } catch (error) {
              console.error('Error checking attendance for teacher schedules:', error);
              // If error, assume no attendance (safer to show conflict)
            }
          } else if (teacherScheduleIds.length > 50) {
            console.warn('Too many schedules to check attendance, skipping attendance check for performance');
          }

          // Compare and find conflicts
          const conflicts = [];
          const parseTime = (time) => {
            if (!time) return null;
            return time.length === 5 ? time : time.slice(0, 5);
          };

          const hasTimeOverlap = (startA, endA, startB, endB) => {
            if (!startA || !endA || !startB || !endB) return false;

            // Chuyển đổi thời gian từ string "HH:MM" sang phút để so sánh chính xác
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

            // Hai khoảng thời gian overlap nếu: startA < endB VÀ endA > startB
            // Lưu ý: Nếu một lớp kết thúc đúng lúc lớp kia bắt đầu (ví dụ: 08:00-10:00 và 10:00-12:00)
            // thì KHÔNG có overlap vì sử dụng > và < (không có =)
            return startAMin < endBMin && endAMin > startBMin;
          };

          // Get current class ID as string for comparison
          const currentClassIdStr = String(classId);

          // Helper function to check conflicts between class schedules and teacher schedules
          const checkConflictsBetweenSchedules = (classSchedules, scheduleSource) => {
            classSchedules.forEach(classSchedule => {
              teacherSchedules.forEach(teacherSchedule => {
                // Skip if it's from the same class (compare by classId)
                const teacherClassIdStr = teacherSchedule.classId ? String(teacherSchedule.classId) : null;

                // Also check by className as fallback
                const isSameClass = teacherClassIdStr && teacherClassIdStr === currentClassIdStr;
                const isSameClassByName = teacherSchedule.className === (fullClassData?.name || 'Lớp hiện tại');

                if (isSameClass || isSameClassByName) {
                  return; // Skip schedules from the same class
                }

                // Skip if this schedule already has attendance (already taught)
                const scheduleIdStr = teacherSchedule._id?.toString();
                if (scheduleIdStr && scheduleIdsWithAttendance.has(scheduleIdStr)) {
                  return; // Skip schedules that already have attendance
                }

                // Check if same date (use formatDateToYYYYMMDD to handle ISO strings)
                if (formatDateToYYYYMMDD(classSchedule.date) === formatDateToYYYYMMDD(teacherSchedule.date)) {
                  const classStart = parseTime(classSchedule.startTime);
                  const classEnd = parseTime(classSchedule.endTime);
                  const teacherStart = parseTime(teacherSchedule.startTime);
                  const teacherEnd = parseTime(teacherSchedule.endTime);

                  // Check time overlap
                  if (hasTimeOverlap(classStart, classEnd, teacherStart, teacherEnd)) {
                    conflicts.push({
                      date: classSchedule.date,
                      classTime: `${classStart} - ${classEnd}`,
                      teacherTime: `${teacherStart} - ${teacherEnd}`,
                      conflictingClass: teacherSchedule.className || 'N/A',
                      conflictingClassId: teacherSchedule.classId || 'N/A',
                      conflictingRoom: teacherSchedule.room,
                      currentClassTime: `${classStart} - ${classEnd}`, // Thông tin lịch lớp hiện tại có xung đột
                      currentClassStartTime: classStart, // Lưu startTime để so khớp chính xác
                      currentClassEndTime: classEnd, // Lưu endTime để so khớp chính xác
                      // Lưu thêm thông tin gốc để debug
                      originalClassStartTime: classSchedule.startTime,
                      originalClassEndTime: classSchedule.endTime,
                      scheduleSource: scheduleSource // Thêm thông tin nguồn lịch để debug
                    });
                  }
                }
              });
            });
          };

          // Check conflicts with current class schedules from database
          checkConflictsBetweenSchedules(currentClassSchedules, 'current_db_schedules');

          // Also check conflicts with generated sessions (new schedules being edited)
          if (generatedSessions.length > 0) {
            const generatedSchedules = generatedSessions.map(session => ({
              date: session.date,
              startTime: session.startTime,
              endTime: session.endTime,
              className: fullClassData?.name || 'Lớp hiện tại (đang chỉnh sửa)'
            }));
            checkConflictsBetweenSchedules(generatedSchedules, 'generated_sessions');
          }

          // Update state for filtering
          try {
            if (conflicts.length > 0) {

              // Update teacherRoomConflicts state to filter out this teacher
              setTeacherRoomConflicts(prev => ({
                ...prev,
                teacherConflicts: conflicts.map(c => ({
                  teacherId: teacherId.toString(),
                  className: c.conflictingClass || 'N/A',
                  date: c.date || '',
                  time: c.teacherTime || '',
                  conflictingClassTime: c.classTime || '',
                  // Lưu thêm thông tin để hiển thị chính xác
                  currentClassTime: c.currentClassTime || c.classTime || '',
                  currentClassStartTime: c.currentClassStartTime || '',
                  currentClassEndTime: c.currentClassEndTime || '',
                  originalClassStartTime: c.originalClassStartTime || '',
                  originalClassEndTime: c.originalClassEndTime || ''
                })),
                conflictingTeacherIds: [teacherId.toString()],
                // Keep existing room conflicts
                roomConflicts: prev.roomConflicts || [],
                conflictingRoomIds: prev.conflictingRoomIds || []
              }));
            } else {
              
              // Clear teacher conflicts for this teacher if no conflicts found
              setTeacherRoomConflicts(prev => {
                const updatedTeacherConflicts = (prev.teacherConflicts || []).filter(
                  c => c.teacherId !== teacherId.toString()
                );
                const updatedConflictingTeacherIds = (prev.conflictingTeacherIds || []).filter(
                  id => id !== teacherId.toString()
                );
                
                return {
                  ...prev,
                  teacherConflicts: updatedTeacherConflicts,
                  conflictingTeacherIds: updatedConflictingTeacherIds
                };
              });
            }
          } catch (error) {
            console.error(' Lỗi khi xử lý conflicts:', error);
            // Don't update state on error to prevent breaking the UI
          }
        }
      } catch (error) {
        console.error(' Lỗi khi lấy và so sánh lịch:', error);
      }
    };

    // Only log when teacher is actually selected and class exists
    if ((formData.teacherId || (fullClassData?.teacher?._id || fullClassData?.teacher?.id)) && 
        (formData.id || formData._id)) {
      logAndCompareSchedules();
    }
  }, [formData.teacherId, formData.id, formData._id, fullClassData, generatedSessions]);

  // Check room conflicts when roomId changes (similar to teacher conflict check)
  useEffect(() => {
    const logAndCompareRoomSchedules = async () => {
      const roomId = formData.roomId || (fullClassData?.room?._id || fullClassData?.room?.id);
      const classId = formData.id || formData._id;
      
      // Clear room conflicts immediately when room changes (before checking new room)
      setTeacherRoomConflicts(prev => ({
        ...prev,
        roomConflicts: [],
        conflictingRoomIds: []
      }));

      if (!roomId || !classId) {
        return;
      }

      try {
        // Get date range from generated sessions if available
        let params = {};
        if (generatedSessions.length > 0) {
          const sessionDates = generatedSessions.map(s => s.date).sort();
          params = {
            startDate: sessionDates[0],
            endDate: sessionDates[sessionDates.length - 1]
          };
        }

        // Get room schedule
        const roomResponse = await roomService.getRoomSchedule(roomId, params);
        
        // Helper function to format date to YYYY-MM-DD using local timezone (not UTC)
        const formatDateLocal = (dateInput) => {
          if (!dateInput) return null;
          const date = new Date(dateInput);
          if (isNaN(date.getTime())) return null;
          
          // Use local timezone, not UTC
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        // Get current class schedules
        const classSchedules = fullClassData?.schedules || [];
        const currentClassSchedules = classSchedules
          .filter(s => s.date && s.startTime && s.endTime)
          .map(s => {
            const scheduleDate = s.date || s.scheduleDate || s.classDate;
            return {
              date: formatDateLocal(scheduleDate),
              startTime: s.startTime || s.start_time,
              endTime: s.endTime || s.end_time,
              className: fullClassData?.name || 'Lớp hiện tại',
              room: s.room?.room_name || s.room?.name || 'N/A',
              status: s.status || 'fixed'
            };
          })
          .filter(s => s.date); // Remove invalid dates

        // Log room schedule
        if (roomResponse && roomResponse.schedules) {
          // Get room name from response (since room is not populated in schedules)
          const roomName = roomResponse.room?.room_name || roomResponse.room?.name || 'N/A';
          
          // Get class IDs from room schedules to filter out current class
          const roomSchedules = roomResponse.schedules.map(schedule => {
            // Get class ID from various possible paths in API response
            // Primary path from API: class._id
            const scheduleClassId = 
              schedule.class?._id?.toString() ||  // Primary path from API
              schedule.class?._id ||              // In case it's already a string
              schedule.classId?.toString() ||
              schedule.classId ||
              schedule.class?.id?.toString() ||
              schedule.class?.id ||
              null; // Don't use schedule._id as fallback - that's wrong
            
            return {
              date: formatDateLocal(schedule.date),
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              className: schedule.className || schedule.class?.name || 'N/A',
              classId: scheduleClassId, // Can be null if no class info
              room: roomName, // Use room name from response
              status: schedule.status,
              _id: schedule._id
            };
          }).filter(s => s.date);

          // Check which room schedules have attendance (already taught)
          // Get schedule IDs from room schedules
          const roomScheduleIds = roomSchedules
            .filter(s => s._id && !s._id.toString().startsWith('generated-'))
            .map(s => s._id.toString());
          
          let scheduleIdsWithAttendance = new Set();
          // Skip attendance check if too many schedules (performance optimization)
          // Backend already filters attendance, so this is just for frontend display
          if (roomScheduleIds.length > 0 && roomScheduleIds.length <= 50) {
            try {
              // Batch requests to avoid overwhelming the server
              const BATCH_SIZE = 5;
              const attendanceChecks = [];
              
              for (let i = 0; i < roomScheduleIds.length; i += BATCH_SIZE) {
                const batch = roomScheduleIds.slice(i, i + BATCH_SIZE);
                const batchResults = await Promise.allSettled(
                  batch.map(async (scheduleId) => {
                    try {
                      // Add timeout to prevent hanging (increased to 5s)
                      const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 5000)
                      );
                      
                      const responsePromise = classScheduleService.getAttendanceByClassSchedule(scheduleId);
                      const response = await Promise.race([responsePromise, timeoutPromise]);
                      
                      const attendances = response?.list || response?.attendances || (Array.isArray(response) ? response : []) || [];
                      // Check if any student has attendance (status is not null/undefined)
                      const hasAnyAttendance = attendances.some(att => att?.attendance?.status != null);
                      return hasAnyAttendance ? scheduleId : null;
                    } catch (error) {
                      // If error checking, assume no attendance (safer to show conflict)
                      // Only log if it's not a timeout (to reduce noise)
                      if (!error.message?.includes('Timeout')) {
                        console.warn(`Warning: Could not check attendance for schedule ${scheduleId}:`, error.message);
                      }
                      return null;
                    }
                  })
                );
                attendanceChecks.push(...batchResults);
              }
              
              scheduleIdsWithAttendance = new Set(
                attendanceChecks
                  .filter(result => result.status === 'fulfilled' && result.value !== null)
                  .map(result => result.value)
              );
            } catch (error) {
              console.error('Error checking attendance for room schedules:', error);
              // If error, assume no attendance (safer to show conflict)
            }
          } else if (roomScheduleIds.length > 50) {
            console.warn('Too many schedules to check attendance, skipping attendance check for performance');
          }

          // Compare and find conflicts
          const conflicts = [];
          const parseTime = (time) => {
            if (!time) return null;
            return time.length === 5 ? time : time.slice(0, 5);
          };

          const hasTimeOverlap = (startA, endA, startB, endB) => {
            if (!startA || !endA || !startB || !endB) return false;
            
            // Chuyển đổi thời gian từ string "HH:MM" sang phút để so sánh chính xác
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
            
            // Hai khoảng thời gian overlap nếu: startA < endB VÀ endA > startB
            // Lưu ý: Nếu một lớp kết thúc đúng lúc lớp kia bắt đầu (ví dụ: 08:00-10:00 và 10:00-12:00)
            // thì KHÔNG có overlap vì sử dụng > và < (không có =)
            return startAMin < endBMin && endAMin > startBMin;
          };

          // Get current class ID as string for comparison
          const currentClassIdStr = String(classId);

          currentClassSchedules.forEach(classSchedule => {
            roomSchedules.forEach(roomSchedule => {
              // Skip if it's from the same class (compare by classId)
              const roomClassIdStr = roomSchedule.classId ? String(roomSchedule.classId) : null;
              
              // Exclude if same class ID
              const isSameClass = currentClassIdStr && roomClassIdStr && roomClassIdStr === currentClassIdStr;
              
              // Also check by class name as fallback
              const scheduleClassName = roomSchedule.className || 'N/A';
              const currentClassName = fullClassData?.name || formData.name || 'Lớp hiện tại';
              const isSameClassByName = currentClassName && scheduleClassName && scheduleClassName === currentClassName;
              
              if (isSameClass || isSameClassByName) {
                return; // Skip schedules from the same class
              }

              // Skip if this schedule already has attendance (already taught)
              const scheduleIdStr = roomSchedule._id?.toString();
              if (scheduleIdStr && scheduleIdsWithAttendance.has(scheduleIdStr)) {
                return; // Skip schedules that already have attendance
              }

              // Check if same date (use formatDateToYYYYMMDD to handle ISO strings)
              if (formatDateToYYYYMMDD(classSchedule.date) === formatDateToYYYYMMDD(roomSchedule.date)) {
                const classStart = parseTime(classSchedule.startTime);
                const classEnd = parseTime(classSchedule.endTime);
                const roomStart = parseTime(roomSchedule.startTime);
                const roomEnd = parseTime(roomSchedule.endTime);

                // Check time overlap
                if (hasTimeOverlap(classStart, classEnd, roomStart, roomEnd)) {
                  conflicts.push({
                    date: classSchedule.date,
                    classTime: `${classStart} - ${classEnd}`,
                    roomTime: `${roomStart} - ${roomEnd}`,
                    conflictingClass: roomSchedule.className || 'N/A',
                    conflictingClassId: roomSchedule.classId || 'N/A',
                    conflictingRoom: roomSchedule.room,
                    currentClassTime: `${classStart} - ${classEnd}`, // Thông tin lịch lớp hiện tại có xung đột
                    currentClassStartTime: classStart, // Lưu startTime để so khớp chính xác
                    currentClassEndTime: classEnd // Lưu endTime để so khớp chính xác
                  });
                }
              }
            });
          });

          // Log comparison results and update state for filtering
          try {
            if (conflicts.length > 0) {
              console.warn(' PHÁT HIỆN XUNG ĐỘT PHÒNG HỌC:', {
                totalConflicts: conflicts.length,
                conflicts: conflicts.map(c => {
                  try {
                    const currentSchedule = currentClassSchedules.find(s => formatDateToYYYYMMDD(s.date) === formatDateToYYYYMMDD(c.date));
                    return {
                      ...c,
                      currentClassSchedule: currentSchedule ? {
                        date: currentSchedule.date,
                        time: `${currentSchedule.startTime} - ${currentSchedule.endTime}`,
                        room: currentSchedule.room
                      } : null,
                      explanation: currentSchedule 
                        ? `Lớp hiện tại "${fullClassData?.name || 'N/A'}" học vào ${currentSchedule.date} (${currentSchedule.startTime} - ${currentSchedule.endTime}) trùng với lớp "${c.conflictingClass}" (${c.roomTime})`
                        : `Không tìm thấy lịch lớp hiện tại vào ngày ${c.date} - có thể là lỗi logic`
                    };
                  } catch (err) {
                    console.error('Error processing conflict:', err, c);
                    return c;
                  }
                }),
                summary: conflicts.map(c => {
                  try {
                    const currentSchedule = currentClassSchedules.find(s => formatDateToYYYYMMDD(s.date) === formatDateToYYYYMMDD(c.date));
                    const currentTime = currentSchedule 
                      ? `${currentSchedule.startTime} - ${currentSchedule.endTime}`
                      : c.classTime;
                    return `Ngày ${c.date}: Lớp hiện tại "${fullClassData?.name || 'N/A'}" (${currentTime}) trùng với lớp "${c.conflictingClass}" (${c.roomTime}) tại phòng ${c.conflictingRoom}`;
                  } catch (err) {
                    return `Ngày ${c.date}: Conflict với lớp "${c.conflictingClass}"`;
                  }
                }),
                note: 'Các buổi học của chính lớp hiện tại đã được loại trừ khỏi danh sách xung đột'
              });

              // Update teacherRoomConflicts state to filter out this room
              setTeacherRoomConflicts(prev => ({
                ...prev,
                roomConflicts: conflicts.map(c => ({
                  roomId: roomId.toString(),
                  className: c.conflictingClass || 'N/A',
                  date: c.date || '',
                  time: c.roomTime || '',
                  conflictingClassTime: c.classTime || ''
                })),
                conflictingRoomIds: [roomId.toString()],
                // Keep existing teacher conflicts
                teacherConflicts: prev.teacherConflicts || [],
                conflictingTeacherIds: prev.conflictingTeacherIds || []
              }));
            } else {
              
              // Clear room conflicts for this room if no conflicts found
              setTeacherRoomConflicts(prev => {
                const updatedRoomConflicts = (prev.roomConflicts || []).filter(
                  c => c.roomId !== roomId.toString()
                );
                const updatedConflictingRoomIds = (prev.conflictingRoomIds || []).filter(
                  id => id !== roomId.toString()
                );
                
                return {
                  ...prev,
                  roomConflicts: updatedRoomConflicts,
                  conflictingRoomIds: updatedConflictingRoomIds
                };
              });
            }
          } catch (error) {
            console.error(' Lỗi khi xử lý conflicts phòng học:', error);
            // Don't update state on error to prevent breaking the UI
          }
        }
      } catch (error) {
        console.error(' Lỗi khi lấy và so sánh lịch phòng:', error);
      }
    };

    // Only log when room is actually selected and class exists
    if ((formData.roomId || (fullClassData?.room?._id || fullClassData?.room?.id)) && 
        (formData.id || formData._id)) {
      logAndCompareRoomSchedules();
    }
  }, [formData.roomId, formData.id, formData._id, fullClassData, generatedSessions]);

  // Check teacher and room conflicts using backend API (only when scheduleEntries change)
  // Teacher conflicts are handled by logAndCompareSchedules above
  // Room conflicts when roomId changes are handled by logAndCompareRoomSchedules above
  // This useEffect only runs when scheduleEntries change to check conflicts with new schedule pattern
  useEffect(() => {
    const checkConflicts = async () => {
      const classId = formData.id || formData._id;
      if (!classId) {
        // Only clear room conflicts, keep teacher conflicts from logAndCompareSchedules
        setTeacherRoomConflicts(prev => ({
          ...prev,
          roomConflicts: [],
          conflictingRoomIds: []
        }));
        return;
      }

      // Only check room conflicts here when scheduleEntries change
      // Room conflicts when roomId changes are handled by logAndCompareRoomSchedules above
      const roomId = formData.roomId || (fullClassData?.room?._id || fullClassData?.room?.id);

      if (!roomId) {
        // Only clear room conflicts, keep teacher conflicts
        setTeacherRoomConflicts(prev => ({
          ...prev,
          roomConflicts: [],
          conflictingRoomIds: []
        }));
        return;
      }

      try {
        setCheckingTeacherRoomConflicts(true);
        const conflictData = {
          teacherId: undefined, // Don't check teacher here, handled by logAndCompareSchedules
          roomId: roomId,
          scheduleEntries: filledScheduleEntries.length > 0 ? filledScheduleEntries : undefined,
          startDate: formData.startDate || (fullClassData?.startDate ? formatDateToYYYYMMDD(fullClassData.startDate) : undefined)
        };

        const response = await classService.checkTeacherRoomConflicts(classId, conflictData);
        
        if (response && response.success) {
          // Merge room conflicts with existing teacher conflicts
          setTeacherRoomConflicts(prev => ({
            ...prev,
            roomConflicts: response.roomConflicts || [],
            conflictingRoomIds: response.conflictingRoomIds || []
            // Keep existing teacherConflicts and conflictingTeacherIds from logAndCompareSchedules
          }));
        } else {
          // Only clear room conflicts, keep teacher conflicts
          setTeacherRoomConflicts(prev => ({
            ...prev,
            roomConflicts: [],
            conflictingRoomIds: []
          }));
        }
      } catch (error) {
        console.error('Error checking room conflicts:', error);
        // Only clear room conflicts on error, keep teacher conflicts
        setTeacherRoomConflicts(prev => ({
          ...prev,
          roomConflicts: [],
          conflictingRoomIds: []
        }));
      } finally {
        setCheckingTeacherRoomConflicts(false);
      }
    };

    // Debounce the conflict check
    const timeoutId = setTimeout(() => {
      checkConflicts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.id, formData._id, formData.roomId, formData.startDate, filledScheduleEntries, generatedSessions.length, fullClassData]);

  // Check attendance for all schedules to determine which sessions have been taught
  useEffect(() => {
    const checkSchedulesAttendance = async () => {
      const dataSource = fullClassData || classData;
      if (!dataSource?.schedules || !Array.isArray(dataSource.schedules) || dataSource.schedules.length === 0) {
        setSchedulesAttendanceMap(new Map());
        return;
      }

      // Get all schedule IDs (only real schedules from database, not generated ones)
      const scheduleIds = dataSource.schedules
        .filter(s => s._id && !s._id.toString().startsWith('generated-'))
        .map(s => s._id.toString());

      if (scheduleIds.length === 0) {
        setSchedulesAttendanceMap(new Map());
        return;
      }

      // Limit to 50 schedules for performance
      if (scheduleIds.length > 50) {
        console.warn('Too many schedules to check attendance, skipping attendance check for performance');
        setSchedulesAttendanceMap(new Map());
        return;
      }

      try {
        // Check attendance for all schedules in parallel with timeout
        const attendanceChecks = await Promise.allSettled(
          scheduleIds.map(async (scheduleId) => {
            try {
              // Add timeout to prevent hanging
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              );
              
              const responsePromise = classScheduleService.getAttendanceByClassSchedule(scheduleId);
              const response = await Promise.race([responsePromise, timeoutPromise]);
              
              const attendances = response?.list || response?.attendances || (Array.isArray(response) ? response : []) || [];
              // Check if any student has attendance (status is not null/undefined)
              const hasAnyAttendance = attendances.some(att => att?.attendance?.status != null);
              return { scheduleId, hasAttendance: hasAnyAttendance };
            } catch (error) {
              // If error checking, assume no attendance
              console.warn(`Warning: Could not check attendance for schedule ${scheduleId}:`, error.message);
              return { scheduleId, hasAttendance: false };
            }
          })
        );
        
        // Build map of scheduleId -> hasAttendance
        const attendanceMap = new Map();
        attendanceChecks
          .filter(result => result.status === 'fulfilled')
          .forEach(result => {
            const { scheduleId, hasAttendance } = result.value;
            attendanceMap.set(scheduleId, hasAttendance);
          });
        
        setSchedulesAttendanceMap(attendanceMap);
      } catch (error) {
        console.error('Error checking attendance for schedules:', error);
        setSchedulesAttendanceMap(new Map());
      }
    };

    checkSchedulesAttendance();
  }, [fullClassData, classData]);

  // Filter rooms - only show available rooms (status = 'available') and exclude those with conflicts
  // Rooms with status 'in_use' or 'maintenance' will not be shown
  const filteredRooms = useMemo(() => {
    // Only show rooms with status 'available', BUT also include the current room even if it's not available
    // This allows users to see the current room status and change it if needed
    const currentClassRoomId = fullClassData?.room?._id || fullClassData?.room?.id;
    const currentScheduleRoomId = selectedScheduleDetail?.roomId || selectedScheduleDetail?.room?._id || selectedScheduleDetail?.room?.id;

    // First filter by status
    const availableRooms = rooms.filter(room => {
      const roomId = room._id || room.id;
      const roomIdStr = String(roomId);
      // Include if room is available OR if it's the current class room OR current schedule room
      return room.status === 'available' ||
             roomIdStr === String(currentClassRoomId) ||
             roomIdStr === String(currentScheduleRoomId);
    });

    // Then filter by conflicts
    if (!effectiveGeneratedSessions.length || conflictingRoomIds.size === 0) {
      return availableRooms;
    }

    const filtered = availableRooms.filter((room) => {
      const roomId = room._id || room.id;
      const roomIdStr = String(roomId);
      
      const hasIdConflict = conflictingRoomIds.has(roomIdStr) || conflictingRoomIds.has(String(room.id));
      
      return !hasIdConflict;
    });

    return filtered;
  }, [rooms, fullClassData, selectedScheduleDetail, effectiveGeneratedSessions, conflictingRoomIds]);

  // Filter teachers to exclude those with conflicts
  const filteredTeachers = useMemo(() => {
    if (!effectiveGeneratedSessions.length || conflictingTeacherIds.size === 0) {
      return teachers;
    }

    const filtered = teachers.filter((teacher) => {
      const teacherId = teacher._id || teacher.id;
      const teacherIdStr = String(teacherId);
      
      const hasIdConflict = conflictingTeacherIds.has(teacherIdStr) || conflictingTeacherIds.has(String(teacher.id));
      
      return !hasIdConflict;
    });

    return filtered;
  }, [teachers, effectiveGeneratedSessions, conflictingTeacherIds]);

  // Get current class schedules for use in render
  const currentClassSchedulesForRender = useMemo(() => {
    const classSchedules = fullClassData?.schedules || [];
    return classSchedules
      .filter(s => s.date && s.startTime && s.endTime)
      .map(s => {
        const scheduleDate = s.date || s.scheduleDate || s.classDate;
        return {
          date: scheduleDate ? formatDateToYYYYMMDD(scheduleDate) : null,
          startTime: s.startTime || s.start_time,
          endTime: s.endTime || s.end_time,
          className: fullClassData?.name || 'Lớp hiện tại',
          room: s.room?.room_name || s.room?.name || 'N/A',
          status: s.status || 'fixed'
        };
      })
      .filter(s => s.date); // Remove invalid dates
  }, [fullClassData]);

  // Calculate student conflicts based on actual schedules
  const studentConflictsMap = useMemo(() => {
    const conflicts = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!selectedStudents || selectedStudents.length === 0) {
      return conflicts;
    }

    // Get current class schedules (only future ones)
    const currentClassSchedules = fullClassData?.schedules || [];
    const futureClassSchedules = currentClassSchedules.filter(schedule => {
      const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
      if (!scheduleDate) return false;
      const date = new Date(scheduleDate);
      date.setHours(0, 0, 0, 0);
      return date >= today;
    });

    // Get current class ID to exclude its schedules from student schedules
    const currentClassId = formData.id || formData._id;
    const currentClassIdStr = currentClassId ? String(currentClassId) : null;

    // Check conflicts with current class schedules
    selectedStudents.forEach(studentId => {
      const studentIdStr = String(studentId);
      const allStudentSchedules = studentSchedules[studentIdStr] || [];
      
      // Loại trừ các schedules của lớp hiện tại khỏi lịch học của học sinh
      // để tránh báo conflict với chính lớp đang chỉnh sửa
      const studentScheduleList = allStudentSchedules.filter(studentSchedule => {
        // Get class ID from various possible paths in API response
        // Primary path from API: classSchedule.class._id
        const scheduleClassId = 
          studentSchedule.classSchedule?.class?._id ||  // Primary path from API
          studentSchedule.classSchedule?.class?.id ||
          studentSchedule.classId ||
          studentSchedule.class?._id ||
          studentSchedule.class?.id;
        
        const scheduleClassIdStr = scheduleClassId ? String(scheduleClassId) : null;
        
        // Exclude if same class ID
        if (currentClassIdStr && scheduleClassIdStr && scheduleClassIdStr === currentClassIdStr) {
          return false; // Exclude schedule of current class
        }
        
        // Also check by class name as fallback
        const scheduleClassName = 
          studentSchedule.classSchedule?.class?.name ||
          studentSchedule.className ||
          studentSchedule.class?.name;
        const currentClassName = fullClassData?.name || formData.name;
        
        if (currentClassName && scheduleClassName && scheduleClassName === currentClassName) {
          return false; // Exclude schedule of current class by name
        }
        
        return true; // Keep schedule from other classes
      });
      
      const studentConflictsList = [];

      futureClassSchedules.forEach(classSchedule => {
        const classScheduleDate = classSchedule.date || classSchedule.scheduleDate || classSchedule.classDate;
        if (!classScheduleDate) return;

        const classDate = new Date(classScheduleDate);
        classDate.setHours(0, 0, 0, 0);
        const classDateStr = formatDateToYYYYMMDD(classDate);
        const classStartTime = parseTime(classSchedule.startTime || classSchedule.start_time);
        const classEndTime = parseTime(classSchedule.endTime || classSchedule.end_time);

        if (!classStartTime || !classEndTime) return;

        // Check against student's schedules
        studentScheduleList.forEach(studentSchedule => {
          const studentScheduleDate = studentSchedule.date || studentSchedule.scheduleDate || studentSchedule.classDate || studentSchedule.classSchedule?.date;
          if (!studentScheduleDate) return;

          const studentDate = new Date(studentScheduleDate);
          studentDate.setHours(0, 0, 0, 0);
          const studentDateStr = formatDateToYYYYMMDD(studentDate);

          // Skip if different dates
          if (studentDateStr !== classDateStr) return;

          // Get student schedule time
          const studentStartTime = parseTime(
            studentSchedule.startTime ||
            studentSchedule.start_time ||
            studentSchedule.time?.start ||
            studentSchedule.classSchedule?.startTime
          );
          const studentEndTime = parseTime(
            studentSchedule.endTime ||
            studentSchedule.end_time ||
            studentSchedule.time?.end ||
            studentSchedule.classSchedule?.endTime
          );

          if (!studentStartTime || !studentEndTime) return;

          // Check time overlap
          const hasTimeConflict = hasTimeOverlap(classStartTime, classEndTime, studentStartTime, studentEndTime);

          if (hasTimeConflict) {
            // Get class name from student schedule
            const conflictingClassName = 
              studentSchedule.className ||
              studentSchedule.class?.name ||
              studentSchedule.classSchedule?.class?.name ||
              'N/A';

            const conflictDetail = {
              className: conflictingClassName,
              date: classDateStr,
              dateDisplay: classDate.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              time: `${studentStartTime} - ${studentEndTime}`,
              newClassTime: `${classStartTime} - ${classEndTime}`,
              type: 'existing_schedule' // Conflict with existing class schedule
            };

            studentConflictsList.push(conflictDetail);
          }
        });
      });

      // Check conflicts with new schedule pattern (if scheduleEntries changed)
      // Sử dụng studentScheduleList đã được lọc (đã loại trừ schedules của lớp hiện tại)
      if (filledScheduleEntries.length > 0 && formData.startDate) {
        filledScheduleEntries.forEach(entry => {
          const dayOfWeek = getDayOfWeekNumber(entry.day);
          if (dayOfWeek === null) return;

          const entryStartTime = parseTime(entry.startTime);
          const entryEndTime = parseTime(entry.endTime);
          if (!entryStartTime || !entryEndTime) return;

          // Check against student's schedules (đã loại trừ schedules của lớp hiện tại)
          studentScheduleList.forEach(studentSchedule => {
            const studentScheduleDate = studentSchedule.date || studentSchedule.scheduleDate || studentSchedule.classDate || studentSchedule.classSchedule?.date;
            if (!studentScheduleDate) return;

            const studentDate = new Date(studentScheduleDate);
            const studentDayOfWeek = studentDate.getDay();

            // Check if same day of week
            if (studentDayOfWeek !== dayOfWeek) return;

            // Get student schedule time
            const studentStartTime = parseTime(
              studentSchedule.startTime ||
              studentSchedule.start_time ||
              studentSchedule.time?.start ||
              studentSchedule.classSchedule?.startTime
            );
            const studentEndTime = parseTime(
              studentSchedule.endTime ||
              studentSchedule.end_time ||
              studentSchedule.time?.end ||
              studentSchedule.classSchedule?.endTime
            );

            if (!studentStartTime || !studentEndTime) return;

            // Check time overlap
            const hasTimeConflict = hasTimeOverlap(entryStartTime, entryEndTime, studentStartTime, studentEndTime);

            if (hasTimeConflict) {
              // Check if this conflict is already in the list (avoid duplicates)
              const studentDateStr = formatDateToYYYYMMDD(studentDate);
              const isDuplicate = studentConflictsList.some(c => formatDateToYYYYMMDD(c.date) === studentDateStr);

              if (!isDuplicate) {
                const conflictingClassName = 
                  studentSchedule.className ||
                  studentSchedule.class?.name ||
                  studentSchedule.classSchedule?.class?.name ||
                  'N/A';

                const conflictDetail = {
                  className: conflictingClassName,
                  date: studentDateStr,
                  dateDisplay: studentDate.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }),
                  time: `${studentStartTime} - ${studentEndTime}`,
                  newClassTime: `${entryStartTime} - ${entryEndTime}`,
                  dayOfWeek: dayOfWeek,
                  type: 'schedule_pattern' // Conflict with new schedule pattern
                };

                studentConflictsList.push(conflictDetail);
              }
            }
          });
        });
      }

      if (studentConflictsList.length > 0) {
        conflicts.set(studentIdStr, studentConflictsList);
      }
    });

    return conflicts;
  }, [selectedStudents, fullClassData?.schedules, studentSchedules, filledScheduleEntries, formData.startDate, formData.id, formData._id]);

  // Update studentConflicts state
  useEffect(() => {
    setStudentConflicts(studentConflictsMap);
  }, [studentConflictsMap]);

  // Clear selected room if it becomes unavailable
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

  // Clear selected teacher if they become unavailable
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

  const daysOfWeek = [
    { value: '2', label: 'Thứ 2' },
    { value: '3', label: 'Thứ 3' },
    { value: '4', label: 'Thứ 4' },
    { value: '5', label: 'Thứ 5' },
    { value: '6', label: 'Thứ 6' },
    { value: '7', label: 'Thứ 7' },
    { value: 'CN', label: 'Chủ nhật' }
  ];

  // Program name to type mapping
  const programTypeMap = {
    'IELTS': 'ielts',
    'TOEIC': 'toeic',
    'Cambridge': 'cam'
  };

  // Reverse mapping: type to program name
  const typeToProgramMap = {
    'ielts': 'IELTS',
    'toeic': 'TOEIC',
    'cam': 'Cambridge'
  };

  // Map program name to type
  const getTypeFromProgram = (programName) => {
    return programTypeMap[programName] || null;
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get status label in Vietnamese
  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Chờ khai giảng',
      'active': 'Đang học',
      'completed': 'Đã hoàn thành',
      'disable': 'Vô hiệu hóa'
    };
    return statusMap[status] || status;
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

      // Match students by email only
      const matchedStudentIds = [];
      const notFound = [];
      const matchedStudentMap = new Map(); // Map<studentId, studentObject> for later use

      emails.forEach((email) => {
        const normalizedEmail = email.toLowerCase().trim();

        const foundStudent = students.find((student) => {
          const studentEmail = (student.email || '').toLowerCase().trim();
          return studentEmail === normalizedEmail;
        });

        if (foundStudent) {
          const studentId = foundStudent._id || foundStudent.id;
          if (studentId && !matchedStudentIds.includes(String(studentId))) {
            matchedStudentIds.push(String(studentId));
            matchedStudentMap.set(String(studentId), foundStudent);
          }
        } else {
          notFound.push(email);
        }
      });

      // Validate student enrollment in course if course is selected
      let validStudentIds = matchedStudentIds;
      let invalidStudents = [];
      
      if (formData.course && matchedStudentIds.length > 0) {
        try {
          // Fetch course details to get studentEnrollments
          const courseResponse = await courseService.getCourseDetails(formData.course);
          
          if (courseResponse && courseResponse.success && courseResponse.data) {
            const course = courseResponse.data;
            const enrolledStudentIds = (course.studentEnrollments || []).map(id => String(id));
            
            // Separate valid and invalid students
            validStudentIds = matchedStudentIds.filter(studentId => 
              enrolledStudentIds.includes(studentId)
            );
            
            const invalidStudentIds = matchedStudentIds.filter(studentId => 
              !enrolledStudentIds.includes(studentId)
            );
            
            // Get student info for invalid students
            invalidStudents = invalidStudentIds.map(studentId => {
              const student = matchedStudentMap.get(studentId);
              const studentName = student?.fullName || student?.name || student?.username || 
                                 student?.email?.split('@')[0] || `Học viên ${studentId}`;
              return {
                studentId: studentId,
                studentName: studentName,
                reason: 'Học viên chưa có trong danh sách đăng ký khóa học'
              };
            });
          }
        } catch (error) {
          console.error('Error fetching course details for validation:', error);
          // If error fetching course, proceed with all matched students but log warning
          console.warn('Could not validate student enrollment, proceeding with all matched students');
        }
      }

      // Add only valid students to selectedStudents (avoid duplicates)
      if (validStudentIds.length > 0) {
        setSelectedStudents(prev => {
          const newSelected = [...new Set([...prev, ...validStudentIds])];
          return newSelected;
        });
      }

      // Show results in modal
      setImportResult({
        success: validStudentIds.length,
        notFound: notFound,
        total: emails.length,
        invalidStudents: invalidStudents.length > 0 ? invalidStudents : undefined,
        courseName: formData.course && selectedCourse ? (selectedCourse.name || 'N/A') : undefined
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

  // Handle students confirmed from SelectStudentModal
  const handleStudentsConfirmed = (selectedStudentIds) => {
    setSelectedStudents(selectedStudentIds);
  };

  // Handle remove student from list
  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(prev => prev.filter(id => id !== studentId));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If only status changes, preserve all other data
    if (name === 'status') {
      setFormData(prev => ({ ...prev, status: value }));
      return;
    }

    // Auto-update band when programId is selected
    if (name === 'programId' && value) {
      const selectedProgram = allProgramsFromDB.find(p => String(p._id) === String(value));
      if (selectedProgram && selectedProgram.band) {
        setFormData(prev => ({ ...prev, programId: value, band: selectedProgram.band }));
        return;
      } else if (selectedProgram) {
        // If program doesn't have band, clear band
        setFormData(prev => ({ ...prev, programId: value, band: '' }));
        return;
      }
    }

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
    
    // If program or level changes, clear course if it doesn't belong to the new program/level
    if (name === 'program' || name === 'level') {
      const newProgram = name === 'program' ? value : formData.program;
      const newLevel = name === 'level' ? value : formData.level;
      
      // If we have a current course, check if it belongs to the new program/level
      if (formData.course && selectedCourse) {
        const courseProgramType = selectedCourse.program?.type;
        const courseLevel = selectedCourse.program?.level;
        
        // If the course doesn't match the new program/level, clear it
        if (newProgram && newLevel && (courseProgramType !== newProgram || courseLevel !== newLevel)) {
          setFormData(prev => ({
            ...prev,
            [name]: value,
            course: '' // Clear course when program/level changes
          }));
          setSelectedCourse(null);
          return;
        }
      } else if (formData.course && (newProgram !== formData.program || newLevel !== formData.level)) {
        // If we don't have selectedCourse but have a course ID, clear it when program/level changes
        setFormData(prev => ({
          ...prev,
          [name]: value,
          course: '' // Clear course when program/level changes
        }));
        setSelectedCourse(null);
        return;
      }
    }
    
    // Validate start date when it changes
    // Only validate for pending/disable classes - active/completed classes can have past start dates
    if (name === 'startDate') {
      const today = getTodayDate();

      // Only validate start date is not in the past for disable classes
      if (formData.status === 'disable' && value && value < today) {
        setDateError('Ngày khai giảng không được là quá khứ!');
      } else {
        setDateError('');
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkDuplicateEntries = (entries) => {
    const duplicates = [];

    entries.forEach((entry, index) => {
      // Chỉ kiểm tra entries đã điền đầy đủ
      if (!entry.day || !entry.startTime || !entry.endTime) {
        return;
      }

      // Check against all previous entries for overlap
      for (let j = 0; j < index; j++) {
        const prevEntry = entries[j];

        // Skip if previous entry is not complete or already marked as duplicate
        if (!prevEntry.day || !prevEntry.startTime || !prevEntry.endTime) {
          continue;
        }
        
        // Check if same day and time overlaps
        if (entry.day === prevEntry.day) {
          const overlap = hasTimeOverlap(entry.startTime, entry.endTime, prevEntry.startTime, prevEntry.endTime);
          
          if (overlap) {
            duplicates.push(index);
            break; // Mark current entry as duplicate and stop checking
          }
        }
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

  // Auto-fetch band when program and level are selected (when status is pending)
  useEffect(() => {
    const fetchBand = async () => {
      // Only fetch band if status is pending (editable mode)
      if (formData.status !== 'disable') {
        return;
      }

      // Priority: band from programId > band from API (type + level)
      // If programId exists and has band, don't fetch from API
      if (formData.programId && formData.band) {
        const selectedProgram = allProgramsFromDB.find(p => String(p._id) === String(formData.programId));
        if (selectedProgram && selectedProgram.band && selectedProgram.band === formData.band) {
          // Band already set from programId, don't fetch
          return;
        }
      }

      if (!formData.program || !formData.level) {
        // Clear band if program (type) or level is missing, but keep band from programId if exists
        if (!formData.programId) {
          setFormData(prev => ({ ...prev, band: '' }));
        }
        return;
      }

      // formData.program is now TYPE (ielts, toeic, cam), use it directly
      const type = formData.program;
      if (!type || !['ielts', 'toeic', 'cam'].includes(type)) {
        // Only clear band if no programId
        if (!formData.programId) {
          setFormData(prev => ({ ...prev, band: '' }));
        }
        return;
      }

      try {
        const response = await courseService.getBandByTypeAndLevel(type, formData.level);

        if (response && response.success && response.band) {
          setFormData(prev => ({ ...prev, band: response.band }));
        } else {
          // Only clear band if no programId
          if (!formData.programId) {
            setFormData(prev => ({ ...prev, band: '' }));
          }
        }
      } catch (error) {
        // Only clear band if no programId
        if (!formData.programId) {
          setFormData(prev => ({ ...prev, band: '' }));
        }
      }
    };

    fetchBand();
  }, [formData.program, formData.level, formData.status, formData.programId, formData.band, allProgramsFromDB]);

  // Real-time capacity validation
  useEffect(() => {
    if (formData.roomId && selectedStudents && selectedStudents.length > 0) {
      const selectedRoom = rooms.find(r => (r._id || r.id) === formData.roomId);
      if (selectedRoom) {
        const roomCapacity = selectedRoom.capacity || selectedRoom.maxCapacity || selectedRoom.maxStudents;
        const studentCount = selectedStudents.length;
        
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
  }, [formData.roomId, selectedStudents, rooms]);

  // Fetch student schedules when students are selected
  useEffect(() => {
    const fetchStudentSchedules = async () => {
      if (!selectedStudents || selectedStudents.length === 0) {
        setStudentSchedules({});
        setStudentConflicts(new Map());
        return;
      }

      // Get date range from fullClassData.schedules or formData dates
      let startDate = null;
      let endDate = null;

      if (fullClassData?.schedules && Array.isArray(fullClassData.schedules) && fullClassData.schedules.length > 0) {
        const dates = fullClassData.schedules
          .map(s => s.date || s.scheduleDate || s.classDate)
          .filter(Boolean)
          .map(d => new Date(d))
          .filter(d => !isNaN(d.getTime()));
        
        if (dates.length > 0) {
          startDate = new Date(Math.min(...dates.map(d => d.getTime())));
          endDate = new Date(Math.max(...dates.map(d => d.getTime())));
        }
      }

      // Fallback to formData dates
      if (!startDate && formData.startDate) {
        startDate = new Date(formData.startDate);
      }
      if (!endDate && formData.endDate) {
        endDate = new Date(formData.endDate);
      }

      // If still no dates, use today + 3 months as default
      if (!startDate) {
        startDate = new Date();
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);
      }

      try {
        setCheckingStudentConflicts(true);
        const schedulesMap = {};

        // Fetch schedules for each selected student
        await Promise.all(
          selectedStudents.map(async (studentId) => {
            if (!studentId) return;

            try {
              const response = await studentService.getStudentSchedule(studentId, {
                startDate: formatDateToYYYYMMDD(startDate),
                endDate: formatDateToYYYYMMDD(endDate)
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
      } catch (error) {
        console.error('Error fetching student schedules:', error);
        setStudentSchedules({});
      } finally {
        setCheckingStudentConflicts(false);
      }
    };

    fetchStudentSchedules();
  }, [selectedStudents, fullClassData?.schedules, formData.startDate, formData.endDate]);

  // Fetch programs and levels when status is pending (editable mode)
  useEffect(() => {
    const fetchProgramsAndLevels = async () => {
      // Don't fetch if formData is not initialized yet
      if (!formData || !formData.status) {
        return;
      }

      if (formData.status !== 'disable') {
        setAvailablePrograms([]);
        setAvailableLevels([]);
        return;
      }

      try {
        const [typesResponse, levelsResponse, programsResponse] = await Promise.all([
          courseService.getAllTypes(),
          courseService.getAllLevels(),
          programService.getAllPrograms() // Fetch all programs from Program table
        ]);

        let allPrograms = [];
        if (typesResponse?.success && typesResponse.types) {
          const allTypes = typesResponse.types;
          // Map type to program name using reverse map
          allPrograms = allTypes.map(type => typeToProgramMap[type]).filter(Boolean);
        }

        // Ensure current program (type) is in the list - convert type to program name
        if (formData.program) {
          const currentProgramName = typeToProgramMap[formData.program];
          if (currentProgramName && !allPrograms.includes(currentProgramName)) {
            allPrograms.push(currentProgramName);
          }
        }
        setAvailablePrograms(allPrograms);

        let allLevels = [];
        if (levelsResponse?.success && levelsResponse.levels) {
          allLevels = levelsResponse.levels;
        }

        // Ensure current level is in the list
        if (formData.level && !allLevels.includes(formData.level)) {
          allLevels.push(formData.level);
        }
        setAvailableLevels(allLevels);

        // Store all programs from DB - only approved and active programs
        // But include current program even if not approved/active (to preserve existing data)
        if (programsResponse?.success && programsResponse.data) {
          const approvedPrograms = programsResponse.data.filter(p => p.status === 'approved' && p.isActive === true);
          
          // If current class has a programId, check if it's in the approved and active list
          // If not, add it to preserve existing data
          let programsToUse = [...approvedPrograms];
          if (formData.programId) {
            const currentProgram = programsResponse.data.find(p => String(p._id) === String(formData.programId));
            if (currentProgram && (currentProgram.status !== 'approved' || currentProgram.isActive !== true)) {
              // Add current program even if not approved or not active
              programsToUse.push(currentProgram);
            }
          }
          
          setAllProgramsFromDB(programsToUse);
          setFilteredProgramsFromDB(programsToUse); // Initially show approved programs + current program
        }
      } catch (error) {
        // Even on error, ensure current values are in the lists
        if (formData.program) {
          const currentProgramName = typeToProgramMap[formData.program];
          if (currentProgramName) {
            setAvailablePrograms([currentProgramName]);
          }
        }
        if (formData.level) {
          setAvailableLevels([formData.level]);
        }
      }
    };

    fetchProgramsAndLevels();
  }, [formData.status, formData.program, formData.level]);


  // Filter levels based on selected program (when status is pending or disable)
  useEffect(() => {
    const filterLevels = async () => {
      if (formData.status !== 'disable') {
        return;
      }

      if (!formData.program) {
        try {
          const response = await courseService.getAllLevels();
          if (response?.success && response.levels) {
            setAvailableLevels(response.levels);
          }
        } catch (error) {
          setAvailableLevels([]);
        }
        return;
      }

      // formData.program is now TYPE (ielts, toeic, cam), use it directly
      const type = formData.program;
      if (!type || !['ielts', 'toeic', 'cam'].includes(type)) {
        setAvailableLevels([]);
        return;
      }

      try {
        const response = await courseService.getLevelsByType(type);
        if (response?.success && response.levels) {
          const levels = response.levels;
          setAvailableLevels(levels);

          // If current level is not available for this type, clear it
          if (formData.level && !levels.includes(formData.level)) {
            setFormData(prev => ({ ...prev, level: '', band: '' }));
          }
        } else {
          setAvailableLevels([]);
        }
      } catch (error) {
        setAvailableLevels([]);
      }
    };

    if (formData.status === 'disable') {
      filterLevels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.program, formData.status]);

  // Filter programs from DB based on selected type and level
  useEffect(() => {
    if (!allProgramsFromDB || allProgramsFromDB.length === 0) {
      return;
    }

    let filtered = allProgramsFromDB;

    // Filter by type (program type)
    if (formData.program) {
      // formData.program is type (ielts, toeic, cam)
      filtered = filtered.filter(prog => prog.type === formData.program);
    }

    // Filter by level
    if (formData.level) {
      filtered = filtered.filter(prog => prog.level === formData.level);
    }

    setFilteredProgramsFromDB(filtered);

    // If current programId is not in filtered list, clear it
    if (formData.programId && !filtered.find(p => p._id === formData.programId)) {
      setFormData(prev => ({ ...prev, programId: '' }));
    }
  }, [formData.program, formData.level, allProgramsFromDB, formData.programId]);

  // Fetch all courses on mount
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await courseService.getAllCourses();

        if (response && response.success && response.data) {
          // Filter to only show courses with status 'completed' or 'active' and isActive = true
          // But include current course even if not completed/active or not active (to preserve existing data)
          const validCourses = response.data.filter(course =>
            (course.status === 'completed' || course.status === 'active') && course.isActive === true
          );
          
          // If current class has a course, check if it's in the valid list
          // If not, add it to preserve existing data
          let coursesToUse = [...validCourses];
          if (formData.course) {
            const currentCourse = response.data.find(c =>
              String(c._id) === String(formData.course) || String(c.id) === String(formData.course)
            );
            if (currentCourse && ((currentCourse.status !== 'completed' && currentCourse.status !== 'active') || currentCourse.isActive !== true)) {
              // Add current course even if not completed/active or not active
              coursesToUse.push(currentCourse);
            }
          }
          
          setAllCourses(coursesToUse);
          setCourses(coursesToUse); // Initially show completed/active courses + current course
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  // Ensure current course is included in allCourses even if not completed/active
  useEffect(() => {
    if (!formData.course || !allCourses.length) return;

    // Check if current course is already in allCourses
    const currentCourseExists = allCourses.some(c => 
      String(c._id) === String(formData.course) || String(c.id) === String(formData.course)
    );

    if (!currentCourseExists) {
      // Current course is not in the list, need to fetch it and add
      const fetchCurrentCourse = async () => {
        try {
          const response = await courseService.getCourseDetails(formData.course);
          if (response?.success && response.data) {
            const currentCourse = response.data;
            // Add current course to allCourses even if not completed/active
            setAllCourses(prev => {
              const exists = prev.some(c => 
                String(c._id) === String(currentCourse._id) || String(c.id) === String(currentCourse._id)
              );
              if (exists) return prev;
              return [...prev, currentCourse];
            });
          }
        } catch (error) {
          // If can't fetch course details, ignore
        }
      };
      fetchCurrentCourse();
    }
  }, [formData.course, allCourses]);

  // Filter courses based on selected filters (program type, level, or programId) and status
  useEffect(() => {
    if (formData.status !== 'disable') {
      // For non-editable status, show only current course if exists
      if (formData.course && selectedCourse) {
        setCourses([selectedCourse]);
      } else {
        setCourses([]);
      }
      return;
    }

    if (!allCourses || allCourses.length === 0) {
      return;
    }

    let filtered = allCourses;

    // Filter by programId (from Program dropdown) if selected
    if (formData.programId) {
      filtered = filtered.filter(course => {
        if (!course.program) return false;
        // course.program can be ObjectId string or populated object
        const programId = typeof course.program === 'object' ? course.program._id : course.program;
        return String(programId) === String(formData.programId);
      });
    } else {
      // Filter by type (formData.program is type: ielts, toeic, cam)
      if (formData.program) {
        filtered = filtered.filter(course => {
          if (!course.program) return false;
          // If program is populated object
          if (typeof course.program === 'object' && course.program.type) {
            return course.program.type === formData.program;
          }
          // If program is just ObjectId, we need to match from allProgramsFromDB
          const programId = course.program;
          const programObj = allProgramsFromDB.find(p => String(p._id) === String(programId));
          return programObj && programObj.type === formData.program;
        });
      }

      // Filter by level
      if (formData.level) {
        filtered = filtered.filter(course => {
          if (!course.program) return false;
          // If program is populated object
          if (typeof course.program === 'object' && course.program.level) {
            return course.program.level === formData.level;
          }
          // If program is just ObjectId, we need to match from allProgramsFromDB
          const programId = course.program;
          const programObj = allProgramsFromDB.find(p => String(p._id) === String(programId));
          return programObj && programObj.level === formData.level;
        });
      }
    }

    // Always include current course if it exists, even if not in filtered list
    if (formData.course && selectedCourse) {
      const courseExists = filtered.some(c => {
        const courseId = c._id || c.id;
        return String(courseId) === String(formData.course);
      });
      if (!courseExists) {
        filtered = [...filtered, selectedCourse];
      }
    }

    setCourses(filtered);
  }, [formData.program, formData.level, formData.programId, formData.status, formData.course, selectedCourse, allCourses, allProgramsFromDB]);

  // Update selectedCourse when course changes (either from dropdown or initial load)
  useEffect(() => {
    const updateSelectedCourse = async () => {
      if (!formData.course) {
        setSelectedCourse(null);
        return;
      }

      // First, try to find course in the courses list (if in disable mode and courses are loaded)
      if (formData.status === 'disable' && courses.length > 0) {
        const foundCourse = courses.find(c => (c._id || c.id) === formData.course);
        if (foundCourse) {
          setSelectedCourse(foundCourse);
          return;
        }
      }

      // Otherwise, fetch course details from API
      try {
        const response = await courseService.getCourseDetails(formData.course);
        
        if (response && response.success && response.data) {
          setSelectedCourse(response.data);
        } else {
          setSelectedCourse(null);
        }
      } catch (error) {
        setSelectedCourse(null);
      }
    };

    updateSelectedCourse();
  }, [formData.course, formData.status, courses]);

  // Transform schedules data for ScheduleCalendar component
  const calendarSchedules = useMemo(() => {
    const dataSource = fullClassData || classData;
    const schedulesToTransform = [];
    
    // Priority 1: Use fullClassData.schedules if available (actual schedules from database)
    if (dataSource?.schedules && Array.isArray(dataSource.schedules) && dataSource.schedules.length > 0) {
      schedulesToTransform.push(...dataSource.schedules);
    } 
    // Priority 2: Fallback to generatedSessions (computed from scheduleEntries)
    else if (generatedSessions && generatedSessions.length > 0) {
      // Convert generatedSessions to schedule-like format
      generatedSessions.forEach((session, index) => {
        schedulesToTransform.push({
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          _id: `generated-${index}`,
          status: 'scheduled'
        });
      });
    }
    
    // Transform to ScheduleCalendar format
    const transformedSchedules = schedulesToTransform.map((schedule, index) => {
      const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
      
      // Format date string directly, don't convert to Date object first
      const dateStr = scheduleDate ? formatDateToYYYYMMDD(scheduleDate) : null;
      
      if (!dateStr) {
        return null;
      }
      
      // Parse date only for time calculations, not for date string
      const date = scheduleDate ? new Date(scheduleDate) : null;
      
      // Get teacher name
      const teacherName = schedule.teacher?.fullName || 
                         schedule.teacher?.name || 
                         schedule.teacherName ||
                         (schedule.teacher?.firstName && schedule.teacher?.lastName 
                           ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}` 
                           : null) ||
                         teachers.find(t => {
                           const teacherId = t._id || t.id;
                           const scheduleTeacherId = schedule.teacher?._id || schedule.teacher?.id || schedule.teacher;
                           return String(teacherId) === String(scheduleTeacherId);
                         })?.fullName || 
                         teachers.find(t => {
                           const teacherId = t._id || t.id;
                           const scheduleTeacherId = schedule.teacher?._id || schedule.teacher?.id || schedule.teacher;
                           return String(teacherId) === String(scheduleTeacherId);
                         })?.name ||
                         'Chưa có';
      
      // Get room name
      const roomName = schedule.room?.room_name || 
                      schedule.room?.name || 
                      schedule.roomName ||
                      rooms.find(r => {
                        const roomId = r._id || r.id;
                        const scheduleRoomId = schedule.room?._id || schedule.room?.id || schedule.room;
                        return String(roomId) === String(scheduleRoomId);
                      })?.room_name ||
                      rooms.find(r => {
                        const roomId = r._id || r.id;
                        const scheduleRoomId = schedule.room?._id || schedule.room?.id || schedule.room;
                        return String(roomId) === String(scheduleRoomId);
                      })?.name ||
                      'Chưa có';
      
      const scheduleId = schedule._id || schedule.id || `schedule-${index}`;
      const hasAttendance = schedulesAttendanceMap.get(String(scheduleId)) || false;
      
      // Check if session has ended or not started
      const now = new Date();
      const scheduleDateTime = new Date(date);
      const startTime = schedule.startTime || schedule.start_time || '08:00';
      const endTime = schedule.endTime || schedule.end_time || '10:00';
      
      // Parse time strings (HH:MM format)
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const sessionStartDateTime = new Date(scheduleDateTime);
      sessionStartDateTime.setHours(startHour, startMinute, 0, 0);
      
      const sessionEndDateTime = new Date(scheduleDateTime);
      sessionEndDateTime.setHours(endHour, endMinute, 0, 0);
      
      // Determine time status
      let timeStatus = 'upcoming'; // 'upcoming', 'ongoing', 'completed'
      if (now > sessionEndDateTime) {
        timeStatus = 'completed'; // Buổi đã kết thúc
      } else if (now >= sessionStartDateTime && now <= sessionEndDateTime) {
        timeStatus = 'ongoing'; // Buổi đang diễn ra
      } else {
        timeStatus = 'upcoming'; // Buổi chưa bắt đầu
      }
      
      // Check if this schedule has pending changes
      const pendingChange = pendingScheduleChanges.find(change => {
        if (change.updateScope === 'future' && change.matchingScheduleIds) {
          return change.matchingScheduleIds.some(id => String(id) === String(scheduleId));
        }
        return String(change.scheduleId) === String(scheduleId);
      });
      
      // Get roomId from schedule
      const scheduleRoomId = schedule.room?._id || schedule.room?.id || schedule.room;

      // Get room status
      const roomData = rooms.find(r => {
        const roomId = r._id || r.id;
        return String(roomId) === String(scheduleRoomId);
      });
      const roomStatus = roomData?.status || schedule.room?.status || 'available';

      return {
        id: scheduleId,
        date: dateStr, // Use formatted string directly, not from Date object
        startTime: startTime,
        endTime: endTime,
        className: formData.name || 'Chưa có tên lớp',
        teacherName: teacherName,
        roomName: roomName,
        roomId: scheduleRoomId, // Add roomId for modal initialization
        roomStatus: roomStatus, // Add room status
        status: schedule.status || 'scheduled',
        lessonNumber: schedule.session?.order || schedule.lessonNumber || null,
        lessonTopic: schedule.session?.title || schedule.lessonTopic || null,
        hasAttendance: hasAttendance, // Thêm property để phân biệt buổi đã học/chưa học
        timeStatus: timeStatus, // 'upcoming', 'ongoing', 'completed'
        isOldClassSchedule: !!pendingChange, // Mark as old schedule if has pending change
        isRoomChangeOnly: pendingChange?.isRoomChangeOnly // Mark if only room changed
      };
    }).filter(Boolean); // Remove null entries
    
    // Add new schedules from pending changes
    const newSchedulesFromPending = [];
    pendingScheduleChanges.forEach(change => {
      if (change.updateScope === 'single') {
        // Get teacher and room info from formData or fullClassData
        const teacherName = teachers.find(t => {
          const teacherId = t._id || t.id;
          const formTeacherId = formData.teacherId || fullClassData?.teacher?._id || fullClassData?.teacher?.id || fullClassData?.teacher;
          return String(teacherId) === String(formTeacherId);
        })?.fullName || 
        teachers.find(t => {
          const teacherId = t._id || t.id;
          const formTeacherId = formData.teacherId || fullClassData?.teacher?._id || fullClassData?.teacher?.id || fullClassData?.teacher;
          return String(teacherId) === String(formTeacherId);
        })?.name ||
        'Chưa có';
        
        // Get new room name from change.newSchedule.roomId if available, otherwise use formData
        const newRoomId = change.newSchedule.roomId || formData.roomId || fullClassData?.room?._id || fullClassData?.room?.id || fullClassData?.room;
        const roomName = rooms.find(r => {
          const roomId = r._id || r.id;
          return String(roomId) === String(newRoomId);
        })?.room_name ||
        rooms.find(r => {
          const roomId = r._id || r.id;
          return String(roomId) === String(newRoomId);
        })?.name ||
        'Chưa có';

        // Add single new schedule
        newSchedulesFromPending.push({
          id: `pending-${change.scheduleId}`,
          date: change.newSchedule.date,
          startTime: change.newSchedule.startTime,
          endTime: change.newSchedule.endTime,
          className: formData.name || 'Chưa có tên lớp',
          teacherName: teacherName,
          roomName: roomName,
          roomId: newRoomId, // Add roomId for modal initialization
          status: 'temporary',
          isNewClassSchedule: true, // Mark as new schedule (preview)
          isRoomChangeOnly: change.isRoomChangeOnly, // Mark if only room changed
          timeStatus: 'upcoming'
        });
      } else if (change.updateScope === 'future') {
        // Calculate and add all future schedules that match the pattern
        // Get the original schedule to find matching pattern
        const originalSchedule = schedulesToTransform.find(s => {
          const sId = s._id || s.id;
          return String(sId) === String(change.scheduleId);
        });
        
        if (originalSchedule) {
          const originalDate = new Date(originalSchedule.date || originalSchedule.scheduleDate || originalSchedule.classDate);
          originalDate.setHours(0, 0, 0, 0);
          const originalDayOfWeek = originalDate.getDay();
          const originalStartTime = originalSchedule.startTime || originalSchedule.start_time;
          const originalEndTime = originalSchedule.endTime || originalSchedule.end_time;
          
          // Find all matching schedules
          const matchingSchedules = schedulesToTransform.filter(s => {
            const sDate = new Date(s.date || s.scheduleDate || s.classDate);
            sDate.setHours(0, 0, 0, 0);
            const sDayOfWeek = sDate.getDay();
            return sDayOfWeek === originalDayOfWeek &&
                   (s.startTime || s.start_time) === originalStartTime &&
                   (s.endTime || s.end_time) === originalEndTime &&
                   sDate >= originalDate;
          });
          
          // Calculate new dates for each matching schedule
          const newDate = new Date(change.newSchedule.date);
          newDate.setHours(0, 0, 0, 0);
          const firstScheduleDate = new Date(matchingSchedules[0]?.date || matchingSchedules[0]?.scheduleDate || matchingSchedules[0]?.classDate || originalDate);
          firstScheduleDate.setHours(0, 0, 0, 0);
          
          matchingSchedules.forEach(matchingSchedule => {
            const originalScheduleDate = new Date(matchingSchedule.date || matchingSchedule.scheduleDate || matchingSchedule.classDate);
            originalScheduleDate.setHours(0, 0, 0, 0);
            
            // Calculate new date based on pattern (similar to backend logic)
            const daysFromFirst = Math.floor((originalScheduleDate.getTime() - firstScheduleDate.getTime()) / (24 * 60 * 60 * 1000));
            const weeksFromFirst = Math.floor(daysFromFirst / 7);
            
            const newScheduleDate = new Date(newDate);
            newScheduleDate.setDate(newDate.getDate() + (weeksFromFirst * 7));
            newScheduleDate.setHours(0, 0, 0, 0);
            
            const futureRoomId = change.newSchedule.roomId || formData.roomId;

            newSchedulesFromPending.push({
              id: `pending-future-${matchingSchedule._id || matchingSchedule.id}`,
              date: formatDateToYYYYMMDD(newScheduleDate),
              startTime: change.newSchedule.startTime,
              endTime: change.newSchedule.endTime,
              className: formData.name || 'Chưa có tên lớp',
              teacherName: teachers.find(t => {
                const teacherId = t._id || t.id;
                const formTeacherId = formData.teacherId;
                return String(teacherId) === String(formTeacherId);
              })?.fullName || 'Chưa có',
              roomName: rooms.find(r => {
                const roomId = r._id || r.id;
                return String(roomId) === String(futureRoomId);
              })?.room_name || 'Chưa có',
              roomId: futureRoomId, // Add roomId for modal initialization
              status: 'temporary',
              isNewClassSchedule: true, // Mark as new schedule (preview)
              isRoomChangeOnly: change.isRoomChangeOnly, // Mark if only room changed
              timeStatus: 'upcoming'
            });
          });
        }
      }
    });
    
    return [...transformedSchedules, ...newSchedulesFromPending];
  }, [fullClassData, classData, generatedSessions, formData.name, formData.teacherId, formData.roomId, teachers, rooms, schedulesAttendanceMap, pendingScheduleChanges]);

  // Update selectedScheduleDetail when calendarSchedules changes (after data refresh)
  useEffect(() => {
    if (showScheduleDetailModal && selectedScheduleDetail) {
      const scheduleId = selectedScheduleDetail.id || selectedScheduleDetail._id;
      // Find the updated schedule from calendarSchedules
      const updatedSchedule = calendarSchedules.find(s =>
        (s.id === scheduleId || s._id === scheduleId) &&
        !s.isOldClassSchedule &&
        !s.isNewClassSchedule
      );

      // Only update if we found the schedule and room has actually changed
      if (updatedSchedule) {
        const currentRoomId = selectedScheduleDetail.roomId || selectedScheduleDetail.room?._id || selectedScheduleDetail.room?.id;
        const newRoomId = updatedSchedule.roomId || updatedSchedule.room?._id || updatedSchedule.room?.id;

        if (currentRoomId !== newRoomId || updatedSchedule.roomName !== selectedScheduleDetail.roomName) {
          // Update selectedScheduleDetail with fresh data
          setSelectedScheduleDetail(updatedSchedule);
          // Also update editedSchedule to reflect the new room
          setEditedSchedule(prev => ({
            ...prev,
            roomId: newRoomId || prev.roomId
          }));
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarSchedules, showScheduleDetailModal]);

  // Calculate first session date when startDate changes
  const firstSessionInfo = useMemo(() => {
    if (!formData.startDate || !initialStartDate || formData.startDate === initialStartDate) {
      return null;
    }

    // Get schedules sorted by date to find the pattern
    const dataSource = fullClassData || classData;
    if (!dataSource?.schedules || dataSource.schedules.length === 0) {
      return null;
    }

    // Get all unique days of week from schedules to find the earliest session
    const sortedSchedules = [...dataSource.schedules]
      .filter(s => s.status === 'fixed')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sortedSchedules.length === 0) {
      return null;
    }

    // Get unique days of week from all schedules
    const daysOfWeekMap = new Map();
    sortedSchedules.forEach(schedule => {
      const scheduleDate = new Date(schedule.date);
      const dayOfWeek = scheduleDate.getDay();
      if (!daysOfWeekMap.has(dayOfWeek)) {
        daysOfWeekMap.set(dayOfWeek, {
          dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime
        });
      }
    });

    // Find the earliest session from new start date
    const [year, month, day] = formData.startDate.split('-').map(Number);
    const newStartDate = new Date(year, month - 1, day);
    const newStartDayOfWeek = newStartDate.getDay();

    let earliestSession = null;
    let minDaysToAdd = Infinity;

    daysOfWeekMap.forEach((sessionInfo) => {
      const targetDayOfWeek = sessionInfo.dayOfWeek;
      let daysToAdd = (targetDayOfWeek - newStartDayOfWeek + 7) % 7;

      if (daysToAdd < minDaysToAdd) {
        minDaysToAdd = daysToAdd;
        earliestSession = {
          dayOfWeek: targetDayOfWeek,
          daysToAdd,
          ...sessionInfo
        };
      }
    });

    if (!earliestSession) {
      return null;
    }

    const newFirstSessionDate = new Date(newStartDate);
    newFirstSessionDate.setDate(newStartDate.getDate() + earliestSession.daysToAdd);

    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    return {
      date: newFirstSessionDate.toLocaleDateString('vi-VN'),
      dayName: dayNames[earliestSession.dayOfWeek],
      time: `${earliestSession.startTime} - ${earliestSession.endTime}`
    };
  }, [formData.startDate, initialStartDate, fullClassData, classData]);

  // Validate schedule conflicts real-time when editedSchedule changes
  useEffect(() => {
    if (!editedSchedule || !showScheduleDetailModal) {
      setScheduleValidationResult(null);
      return;
    }

    // Only validate if we have all required fields
    if (!editedSchedule.date || !editedSchedule.startTime || !editedSchedule.endTime) {
      setScheduleValidationResult(null);
      return;
    }

    // Don't validate for past schedules
    const scheduleDate = new Date(editedSchedule.date);
    scheduleDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (scheduleDate < today) {
      setScheduleValidationResult(null);
      return;
    }

    const validateConflicts = async () => {
      try {
        setValidatingScheduleEdit(true);
        setScheduleValidationResult(null);

        const classId = formData.id || formData._id;
        const roomId = editedSchedule.roomId || fullClassData?.room?._id || fullClassData?.room?.id;

        if (!classId || !roomId) {
          setValidatingScheduleEdit(false);
          return;
        }

        const scheduleId = selectedScheduleDetail?.id;

        const validationResult = await classScheduleService.validateAddClassSchedule({
          classId: classId,
          date: editedSchedule.date,
          startTime: editedSchedule.startTime,
          endTime: editedSchedule.endTime,
          room: roomId,
          excludeScheduleId: scheduleId
        });

        setScheduleValidationResult(validationResult);
        setValidatingScheduleEdit(false);
      } catch (error) {
        console.error('Lỗi khi validate conflict:', error);
        setValidatingScheduleEdit(false);
      }
    };

    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(() => {
      validateConflicts();
    }, 500);

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedSchedule?.date, editedSchedule?.startTime, editedSchedule?.endTime, editedSchedule?.roomId, showScheduleDetailModal]);

  // Log room status when opening schedule detail modal
  useEffect(() => {
    if (!selectedScheduleDetail || !showScheduleDetailModal) {
      return;
    }

    const logRoomStatus = async () => {
      const roomId = selectedScheduleDetail.roomId || fullClassData?.room?._id || fullClassData?.room?.id;
      const roomName = selectedScheduleDetail.roomName || fullClassData?.room?.room_name;

      if (!roomId) {
        console.log('⚠️ Không tìm thấy thông tin phòng học');
        return;
      }

      try {
        // Get room details including status
        const roomData = await roomService.getRoomById(roomId);

        // Display status with icon
        const statusMap = {
          'available': '✅ Sẵn sàng',
          'in_use': '🔴 Đang sử dụng',
          'maintenance': '🔧 Bảo trì'
        };
        const status = roomData.room?.status || 'available';
        console.log(`Trạng thái: ${statusMap[status] || status}`);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } catch (error) {
        console.log('⚠️ Không thể lấy thông tin phòng học:', error.message);
      }
    };

    logRoomStatus();
  }, [selectedScheduleDetail, showScheduleDetailModal, fullClassData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.level || !formData.program) {
      await Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng điền đầy đủ thông tin bắt buộc!'
      });
      return;
    }

    // Validate course is selected
    if (!formData.course) {
      await Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn course!'
      });
      return;
    }

    if (
      formData.scheduleEntries.length === 0 ||
      formData.scheduleEntries.some(entry => !entry.day)
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn ít nhất 1 ngày học và điền đủ thời gian!'
      });
      return;
    }

    if (
      formData.scheduleEntries.some(
        entry => entry.startTime >= entry.endTime
      )
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'Thông tin không hợp lệ',
        text: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc!'
      });
      return;
    }

    // Check for duplicate schedule entries
    const duplicateIndices = checkDuplicateEntries(formData.scheduleEntries);
    if (duplicateIndices.length > 0) {
      setScheduleEntriesError('Có các buổi học trùng lặp. Vui lòng kiểm tra lại ngày và giờ học.');
      await Swal.fire({
        icon: 'warning',
        title: 'Trùng lặp',
        text: 'Có các buổi học trùng lặp. Vui lòng kiểm tra lại ngày và giờ học.'
      });
      return;
    }
    setScheduleEntriesError(null);

    // Validate start date is not in the past
    // Only validate for disable classes - active/completed classes can have past start dates
    if (formData.status === 'disable') {
      const today = getTodayDate();
      if (formData.startDate && formData.startDate < today) {
        await Swal.fire({
          icon: 'warning',
          title: 'Ngày không hợp lệ',
          text: 'Ngày khai giảng không được là quá khứ!'
        });
        setDateError('Ngày khai giảng không được là quá khứ!');
        return;
      }
    }

    // Validate room capacity if room is selected
    if (formData.roomId) {
      const selectedRoom = rooms.find(r => (r._id || r.id) === formData.roomId);
      if (selectedRoom) {
        const roomCapacity = selectedRoom.capacity || selectedRoom.maxCapacity || selectedRoom.maxStudents;
        const studentCount = (selectedStudents || []).length;
        
        if (roomCapacity && studentCount > roomCapacity) {
          await Swal.fire({
            icon: 'warning',
            title: 'Vượt quá sức chứa',
            text: `Số học viên (${studentCount}) vượt quá sức chứa của phòng (${roomCapacity} học viên). Vui lòng chọn phòng lớn hơn hoặc giảm số học viên.`
          });
          return;
        }
      }
    }

    // Check for teacher conflicts before submitting
    if (teacherRoomConflicts.teacherConflicts.length > 0) {
      const conflictCount = teacherRoomConflicts.teacherConflicts.length;
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo xung đột',
        html: `Giáo viên đã chọn có ${conflictCount} xung đột lịch học.<br/><br/>Bạn có chắc chắn muốn tiếp tục cập nhật lớp học không?`,
        showCancelButton: true,
        confirmButtonText: 'Tiếp tục',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#ffc107',
        cancelButtonColor: '#6c757d'
      });
      
      if (!result.isConfirmed) {
        return;
      }
    }

    // Check for room conflicts before submitting
    if (teacherRoomConflicts.roomConflicts.length > 0) {
      const conflictCount = teacherRoomConflicts.roomConflicts.length;
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo xung đột',
        html: `Phòng học đã chọn có ${conflictCount} xung đột lịch học.<br/><br/>Bạn có chắc chắn muốn tiếp tục cập nhật lớp học không?`,
        showCancelButton: true,
        confirmButtonText: 'Tiếp tục',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#ffc107',
        cancelButtonColor: '#6c757d'
      });
      
      if (!result.isConfirmed) {
        return;
      }
    }

    // Check for student conflicts before submitting
    if (studentConflicts.size > 0) {
      const conflictCount = Array.from(studentConflicts.values()).reduce((sum, conflicts) => sum + conflicts.length, 0);
      const studentCount = studentConflicts.size;
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo xung đột',
        html: `Có ${studentCount} học viên với tổng cộng ${conflictCount} xung đột lịch học.<br/><br/>Bạn có chắc chắn muốn tiếp tục cập nhật lớp học không?`,
        showCancelButton: true,
        confirmButtonText: 'Tiếp tục',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#ffc107',
        cancelButtonColor: '#6c757d'
      });
      
      if (!result.isConfirmed) {
        return;
      }
    }

    // Ensure id is present before submitting
    if (!formData.id) {
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không tìm thấy ID của lớp học. Vui lòng thử lại.'
      });
      return;
    }

    // Check if class room has changed
    const initialRoomId = fullClassData?.room?._id || fullClassData?.room?.id || fullClassData?.room;
    const hasClassRoomChanged = formData.roomId && String(formData.roomId) !== String(initialRoomId);

    console.log('=== ROOM CHANGE CHECK ===');
    console.log('Initial room ID:', initialRoomId);
    console.log('Current room ID:', formData.roomId);
    console.log('Has class room changed:', hasClassRoomChanged);
    console.log('Has pending schedule changes:', pendingScheduleChanges.length > 0);

    // Priority logic:
    // 1. If class room changed → submit form to update all schedules at once (ignore individual schedule changes)
    // 2. If class room NOT changed → process individual schedule changes

    if (hasClassRoomChanged) {
      console.log('→ Ưu tiên cập nhật phòng học của lớp (sẽ update tất cả buổi học)');
      // Clear pending schedule changes since class room update will override them
      if (pendingScheduleChanges.length > 0) {
        console.log('→ Bỏ qua các thay đổi lịch học riêng lẻ vì phòng học của lớp đã thay đổi');
        setPendingScheduleChanges([]);
      }
      // Continue to submit form below
    } else if (pendingScheduleChanges.length > 0) {
      console.log('→ Xử lý các thay đổi lịch học riêng lẻ');
      // Apply pending schedule changes before submitting
      try {
        console.log('\n=== BẮT ĐẦU CẬP NHẬT LỊCH HỌC ===');
        console.log(`Tổng số buổi cần update: ${pendingScheduleChanges.length}\n`);

        // Apply all pending schedule changes
        for (const change of pendingScheduleChanges) {
          const updateData = {
            date: change.newSchedule.date,
            startTime: change.newSchedule.startTime,
            endTime: change.newSchedule.endTime,
            room: change.newSchedule.roomId,
            updateScope: change.updateScope
          };

          console.log(`\n📝 Đang cập nhật buổi học ID: ${change.scheduleId}`);
          console.log(`   Scope: ${change.updateScope}`);
          console.log(`   Old: ${change.oldSchedule.date} ${change.oldSchedule.startTime}-${change.oldSchedule.endTime} (Phòng: ${change.oldSchedule.roomId})`);
          console.log(`   New: ${change.newSchedule.date} ${change.newSchedule.startTime}-${change.newSchedule.endTime} (Phòng: ${change.newSchedule.roomId})`);

          try {
            await classScheduleService.updateClassSchedule(change.scheduleId, updateData);
            console.log(`   ✅ Cập nhật thành công`);
          } catch (error) {
            console.error(`   ❌ Cập nhật thất bại:`, error);
            throw error;
          }
        }

        console.log('\n─────────────────────────────────');
        console.log('🔄 Đang refresh dữ liệu lớp học...\n');

        // Refresh class data to get updated schedules
        const classId = formData.id || formData._id;
        if (classId) {
          try {
            const response = await classService.getClassById(classId);

            if (response && response.success && response.class) {
              // Log một vài buổi để kiểm tra
              if (response.class.schedules && response.class.schedules.length > 0) {
                const updatedSchedule = response.class.schedules.find(s =>
                  String(s._id || s.id) === String(pendingScheduleChanges[0].scheduleId)
                );
              }

              setFullClassData(response.class);
            } else if (response && response.data) {

              setFullClassData(response.data);
            }
          } catch (error) {
            console.error('❌ LỖI khi refresh:', error);
          }
        }

        // Clear pending changes after successful update
        setPendingScheduleChanges([]);

        // Hiển thị thông báo thành công
        await Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Đã cập nhật lịch học thành công!',
          timer: 2000,
          showConfirmButton: false
        });

        // RETURN để KHÔNG submit form (không gọi onSubmit)
        return;
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật buổi học. Vui lòng thử lại.'
        });
        return; // Don't submit form if schedule update fails
      }
    }

    // Transform formData to match backend API expectations
    const submitData = {
      ...formData,
      id: formData.id, // Explicitly ensure id is included
      students: selectedStudents || [], // Map selectedStudents to students for backend
      teacher: formData.teacherId, // Map teacherId to teacher for backend
      room: formData.roomId // Map roomId to room for backend
    };

    // Remove selectedStudents, teacherId, roomId from submitData as they're now mapped
    delete submitData.selectedStudents;
    delete submitData.teacherId;
    delete submitData.roomId;

    onSubmit(submitData);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/academic/class-management');
    }
  };

  return (
    <Container fluid className="py-24 px-24">
      {/* Page Header */}
      <div className="mb-24">
        <div className="d-flex align-items-center gap-12 mb-16">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleBack}
            className="d-flex align-items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </Button>
        </div>
        <div className="d-flex align-items-center gap-12 mb-8">
          <div className="bg-warning-600 text-white rounded-8 d-flex align-items-center justify-content-center"
               style={{ width: '48px', height: '48px', minWidth: '48px' }}>
            <i className="fas fa-edit fa-lg"></i>
          </div>
          <div>
            <h2 className="text-neutral-900 fw-bold mb-0">Chỉnh sửa thông tin lớp học</h2>
            <p className="text-neutral-500 mb-0 text-14 mt-4">Cập nhật thông tin và cài đặt cho lớp học</p>
          </div>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Body className="p-32">
          {/* Basic Information */}
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
                  {fullClassData?.status === 'disable' ? (
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="VD: A1-Morning-01"
                      required
                      className="border-neutral-30 radius-8 px-16 py-10"
                    />
                  ) : (
                    <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                      {formData.name}
                    </div>
                  )}
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  {(fullClassData?.status === 'active' || fullClassData?.status === 'completed') ? (
                    <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                      {getStatusLabel(fullClassData?.status || formData.status)}
                    </div>
                  ) : (
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="border-neutral-30 radius-8 px-16 py-10"
                    >
                      <option value="pending">{getStatusLabel('pending')}</option>
                      <option value="disable">{getStatusLabel('disable')}</option>
                    </Form.Select>
                  )}
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Chương trình <span className="text-danger-600">*</span>
                  </Form.Label>
                  {formData.status === 'disable' ? (
                    <Form.Select
                      name="program"
                      value={typeToProgramMap[formData.program] || ''}
                      onChange={(e) => {
                        // Convert program name to type when user selects
                        const selectedProgramName = e.target.value;
                        const selectedType = programTypeMap[selectedProgramName] || '';
                        handleInputChange({ target: { name: 'program', value: selectedType } });
                      }}
                      required
                      className="border-neutral-30 radius-8 px-16 py-10"
                    >
                      <option value="">-- Chọn chương trình --</option>
                      {availablePrograms.length > 0 ? (
                        availablePrograms.map(program => (
                          <option key={program} value={program}>
                            {program}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Đang tải danh sách chương trình...</option>
                      )}
                    </Form.Select>
                  ) : (
                    <>
                      <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                        {typeToProgramMap[formData.program] || formData.program || '--'}
                      </div>
                      <input type="hidden" name="program" value={formData.program} />
                    </>
                  )}
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Cấp độ <span className="text-danger-600">*</span>
                  </Form.Label>
                  {formData.status === 'disable' ? (
                    <Form.Select
                      name="level"
                      value={formData.level || ''}
                      onChange={handleInputChange}
                      required
                      className="border-neutral-30 radius-8 px-16 py-10"
                      disabled={!formData.program}
                    >
                      <option value="">-- Chọn cấp độ --</option>
                      {availableLevels.length > 0 ? (
                        availableLevels.map(level => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {!formData.program ? 'Chọn chương trình trước' : 'Đang tải danh sách cấp độ...'}
                        </option>
                      )}
                    </Form.Select>
                  ) : (
                    <>
                      <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                        {formData.level || '--'}
                      </div>
                      <input type="hidden" name="level" value={formData.level} />
                    </>
                  )}
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Program
                  </Form.Label>
                  {formData.status === 'disable' ? (
                    <Form.Select
                      name="programId"
                      value={formData.programId}
                      onChange={handleInputChange}
                      className="border-neutral-30 radius-8 px-16 py-10"
                    >
                      <option value="">-- Tất cả programs --</option>
                      {(formData.program || formData.level ? filteredProgramsFromDB : allProgramsFromDB).map(prog => (
                        <option key={prog._id} value={prog._id}>
                          {prog.program_name} ({prog.code})
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <>
                      <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                        {formData.programId
                          ? (allProgramsFromDB.find(p => p._id === formData.programId)?.program_name || formData.programId)
                          : '--'}
                      </div>
                      <input type="hidden" name="programId" value={formData.programId} />
                    </>
                  )}
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Course <span className="text-danger-600">*</span>
                  </Form.Label>
                  {formData.status === 'disable' ? (
                    <Form.Select
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      required
                      className="border-neutral-30 radius-8 px-16 py-10"
                      disabled={coursesLoading}
                    >
                      <option value="">
                        {coursesLoading ? 'Đang tải...' : '-- Chọn course --'}
                      </option>
                      {courses.map(course => {
                        const courseId = course._id || course.id;
                        const courseName = course.name || '';
                        const sessions = course.numberOfSessions ? ` (${course.numberOfSessions} buổi)` : '';
                        return (
                          <option key={courseId} value={courseId}>
                            {courseName}{sessions}
                          </option>
                        );
                      })}
                    </Form.Select>
                  ) : (
                    <>
                      <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                        {selectedCourse ? `${selectedCourse.name}${selectedCourse.numberOfSessions ? ` (${selectedCourse.numberOfSessions} buổi)` : ''}` : (formData.course ? 'Đang tải...' : '--')}
                      </div>
                      <input type="hidden" name="course" value={formData.course} />
                    </>
                  )}
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Band</Form.Label>
                  <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                    {formData.band || '--'}
                  </div>
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
                  {fullClassData?.status === 'disable' ? (
                    <>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={getTodayDate()}
                        disabled={pendingScheduleChanges.length > 0}
                        className={`border-neutral-30 radius-8 px-16 py-10 ${dateError ? 'border-danger' : ''}`}
                      />
                      {pendingScheduleChanges.length > 0 && (
                        <Form.Text className="text-warning-600 text-12 d-block mt-4">
                          <i className="fas fa-lock me-1"></i>
                          Không thể thay đổi ngày khai giảng khi đang chỉnh sửa lịch học. Vui lòng hủy thay đổi lịch trước.
                        </Form.Text>
                      )}
                      {dateError && dateError.includes('quá khứ') && (
                        <Form.Text className="text-danger-600 text-12 d-block mt-4">
                          {dateError}
                        </Form.Text>
                      )}
                    </>
                  ) : (
                    <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                      {formData.startDate ? new Date(formData.startDate).toLocaleDateString('vi-VN') : '--'}
                    </div>
                  )}
                </Form.Group>
              </div>
              <div className="col-md-6">
                {firstSessionInfo && (
                  <div className="border border-danger bg-danger-subtle rounded-8 p-12">
                    <div className="text-danger-700 fw-medium text-14 mb-4">
                      <i className="fas fa-info-circle me-2"></i>
                      Ngày khai giảng đã thay đổi nên buổi học đầu tiên của lớp bắt đầu vào ngày:
                    </div>
                    <div className="text-neutral-900 fw-semibold text-15">
                      {firstSessionInfo.dayName}, {firstSessionInfo.date} ({firstSessionInfo.time})
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <div className="mb-24">
            <div className="d-flex justify-content-between align-items-center mb-16 pb-12 border-bottom border-neutral-100">
              <h5 className="text-neutral-900 fw-semibold mb-0">
                Thời khóa biểu
              </h5>
              
              <div className="d-flex align-items-center gap-2">
                {(pendingScheduleChanges.length > 0 || formData.startDate !== initialStartDate) && (
                  <Button
                    variant="outline-danger"
                    className="text-14 fw-medium px-16 py-8"
                    onClick={async () => {
                      const changes = [];
                      if (pendingScheduleChanges.length > 0) {
                        changes.push('thay đổi buổi học');
                      }
                      if (formData.startDate !== initialStartDate) {
                        changes.push('thay đổi ngày khai giảng');
                      }

                      const result = await Swal.fire({
                        title: 'Xác nhận hủy thay đổi',
                        text: `Bạn có chắc chắn muốn hủy tất cả ${changes.join(' và ')} đã lưu tạm thời?`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Xác nhận',
                        cancelButtonText: 'Hủy',
                        confirmButtonColor: '#dc3545',
                        cancelButtonColor: '#6c757d'
                      });

                      if (result.isConfirmed) {
                        setPendingScheduleChanges([]);
                        if (formData.startDate !== initialStartDate) {
                          setFormData(prev => ({ ...prev, startDate: initialStartDate }));
                        }
                      }
                    }}
                  >
                    <i className="fas fa-times me-2"></i>
                    Hủy thay đổi
                  </Button>
                )}
                
                {calendarSchedules.length > 0 && (
                  <ButtonGroup>
                    <Button
                      className={calendarViewMode === 'month' 
                        ? 'btn-main text-14 fw-medium px-16 py-8' 
                        : 'btn-outline-main text-14 fw-medium px-16 py-8'}
                      onClick={() => setCalendarViewMode('month')}
                    >
                      <i className="fas fa-calendar me-2"></i>
                      Tháng
                    </Button>
                    <Button
                      className={calendarViewMode === 'week' 
                        ? 'btn-main text-14 fw-medium px-16 py-8' 
                        : 'btn-outline-main text-14 fw-medium px-16 py-8'}
                      onClick={() => setCalendarViewMode('week')}
                    >
                      <i className="fas fa-calendar-week me-2"></i>
                      Tuần
                    </Button>
                  </ButtonGroup>
                )}
              </div>
            </div>
            
            {calendarSchedules.length > 0 ? (
              <div className="border border-neutral-100 rounded-12 p-16 bg-white position-relative">
                {/* Overlay khi startDate bị thay đổi */}
                {formData.startDate !== initialStartDate && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center rounded-12"
                    style={{ zIndex: 10 }}
                  >
                    <div className="text-center">
                      <i className="fas fa-lock fa-3x text-warning mb-3"></i>
                      <div className="text-neutral-700 fw-medium mb-2">Lịch học đã bị khóa</div>
                      <div className="text-neutral-500 text-13">
                        Không thể chỉnh sửa lịch khi đang thay đổi ngày khai giảng.<br/>
                        Vui lòng hủy thay đổi ngày khai giảng hoặc lưu thay đổi trước.
                      </div>
                    </div>
                  </div>
                )}

                {calendarViewMode === 'month' ? (
                  <ScheduleCalendar
                    schedules={calendarSchedules}
                    onLessonClick={(scheduleId) => {
                      // Khóa khi startDate bị thay đổi hoặc status là completed
                      if (formData.startDate !== initialStartDate || fullClassData?.status === 'completed') {
                        return;
                      }

                      // Tìm schedule từ calendarSchedules dựa trên scheduleId
                      const schedule = calendarSchedules.find(s =>
                        s.id === scheduleId || s._id === scheduleId || String(s.id) === String(scheduleId)
                      );
                      if (schedule) {
                        // Kiểm tra nếu schedule là preview (lớp cũ hoặc lớp mới)
                        if (schedule.isOldClassSchedule || schedule.isNewClassSchedule) {
                          return;
                        }
                        setSelectedScheduleDetail(schedule);
                        setShowScheduleDetailModal(true);
                      }
                    }}
                    onDeleteSchedule={() => {}} // Read-only in this context
                    showLegend={false}
                  />
                ) : (
                  <ScheduleWeekly
                    schedules={calendarSchedules}
                    onScheduleClick={(schedule) => {
                      // Khóa khi startDate bị thay đổi hoặc status là completed
                      if (formData.startDate !== initialStartDate || fullClassData?.status === 'completed') {
                        return;
                      }

                      // Kiểm tra nếu schedule là preview (lớp cũ hoặc lớp mới)
                      if (schedule.isOldClassSchedule || schedule.isNewClassSchedule) {
                        return;
                      }
                      setSelectedScheduleDetail(schedule);
                      setShowScheduleDetailModal(true);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="border border-neutral-100 rounded-12 p-24 bg-neutral-25 text-center">
                <i className="fas fa-calendar-times fa-2x mb-12 text-neutral-300"></i>
                <div className="text-neutral-600 text-14">
                  Chưa có lịch học nào. Vui lòng thiết lập thời khóa biểu ở trên để xem lịch học trên calendar.
                </div>
              </div>
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
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Giáo viên</Form.Label>
                  <Form.Select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
                    disabled={teachers.length === 0 || fullClassData?.status === 'completed'}
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
                    {checkingTeacherRoomConflicts
                      ? 'Đang kiểm tra xung đột...'
                      : teachers.length === 0
                      ? 'Đang tải danh sách giáo viên...'
                      : `Có ${filteredTeachers.length} giáo viên. ${effectiveGeneratedSessions.length > 0 ? 'Chọn giáo viên để kiểm tra xung đột lịch học.' : 'Chọn lịch học để kiểm tra xung đột.'}`}
                  </Form.Text>
                  {teacherRoomConflicts.teacherConflicts.length > 0 && formData.teacherId && 
                   teacherRoomConflicts.teacherConflicts.some(c => c.teacherId === (formData.teacherId?.toString() || String(formData.teacherId))) && (
                    <Alert variant="warning" className="mt-12 mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <strong> CẢNH BÁO XUNG ĐỘT LỊCH HỌC:</strong> Giáo viên đã chọn có <strong>{teacherRoomConflicts.teacherConflicts.filter(c => c.teacherId === (formData.teacherId?.toString() || String(formData.teacherId))).length} xung đột</strong> với các lớp khác.
                      <div className="mt-8">
                        <details>
                          <summary className="cursor-pointer fw-medium text-13 mb-8">
                            <i className="fas fa-info-circle me-2"></i>
                            Xem chi tiết {teacherRoomConflicts.teacherConflicts.length} xung đột
                          </summary>
                          <div className="mt-8 p-12 bg-warning-25 rounded-8 border border-warning-200">
                            <div className="text-12 fw-semibold mb-8 text-warning-900">
                              Giáo viên này đang dạy các lớp khác vào cùng thời gian:
                            </div>
                            <ul className="mb-0 ms-16 text-12">
                              {teacherRoomConflicts.teacherConflicts
                                .filter(c => {
                                  try {
                                    return c.teacherId === (formData.teacherId?.toString() || String(formData.teacherId));
                                  } catch (err) {
                                    console.error('Error filtering conflicts:', err);
                                    return false;
                                  }
                                })
                                // Remove duplicate conflicts based on unique key
                                .filter((conflict, index, self) => {
                                  const key = `${conflict.date}-${conflict.time || conflict.teacherTime}-${conflict.className}`;
                                  return index === self.findIndex(c => 
                                    `${c.date}-${c.time || c.teacherTime}-${c.className}` === key
                                  );
                                })
                                .map((conflict, idx) => {
                                  try {
                                    // Get current class schedule for this date AND time to show the exact conflicting schedule
                                    // Nếu có nhiều buổi trong cùng một ngày, cần tìm đúng buổi có xung đột
                                    let currentSchedule = null;
                                    if (conflict.currentClassStartTime && conflict.currentClassEndTime) {
                                      // Tìm buổi học có cùng ngày VÀ cùng thời gian
                                      currentSchedule = currentClassSchedulesForRender?.find(s => {
                                        if (!s || s.date !== conflict.date) return false;
                                        const sStart = s.startTime || '';
                                        const sEnd = s.endTime || '';
                                        return sStart === conflict.currentClassStartTime && sEnd === conflict.currentClassEndTime;
                                      });
                                    }
                                    
                                    // Nếu không tìm thấy bằng thời gian chính xác, fallback về tìm theo ngày
                                    if (!currentSchedule) {
                                      currentSchedule = currentClassSchedulesForRender?.find(s => formatDateToYYYYMMDD(s?.date) === formatDateToYYYYMMDD(conflict?.date));
                                    }
                                    
                                    // Ưu tiên dùng thời gian từ conflict object (đã được lưu chính xác khi phát hiện conflict)
                                    let currentClassTime = conflict.currentClassTime || conflict.classTime;
                                    
                                    // Nếu không có, thử tìm từ currentSchedule
                                    if (!currentClassTime && currentSchedule) {
                                      currentClassTime = `${currentSchedule.startTime || ''} - ${currentSchedule.endTime || ''}`;
                                    }
                                    
                                    // Nếu vẫn không có, log warning và dùng fallback
                                    if (!currentClassTime || currentClassTime === 'N/A') {
                                      console.warn(' [DEBUG] Không tìm thấy thời gian lớp hiện tại cho conflict:', {
                                        conflict,
                                        currentSchedule,
                                        currentClassSchedulesForRender: currentClassSchedulesForRender?.filter(s => formatDateToYYYYMMDD(s?.date) === formatDateToYYYYMMDD(conflict?.date))
                                      });
                                      currentClassTime = conflict.originalClassStartTime && conflict.originalClassEndTime
                                        ? `${conflict.originalClassStartTime} - ${conflict.originalClassEndTime}`
                                        : 'N/A';
                                    }
                                    
                                    // Log để debug
                                    if (formatDateToYYYYMMDD(conflict.date) === '2025-12-01') {
                                      console.log(' [DEBUG] Hiển thị conflict cho ngày 2025-12-01:', {
                                        conflict,
                                        currentSchedule,
                                        currentClassTime,
                                        currentClassSchedulesForRender: currentClassSchedulesForRender?.filter(s => formatDateToYYYYMMDD(s?.date) === '2025-12-01')
                                      });
                                    }
                                    
                                    return (
                                      <li key={idx || `conflict-${idx}`} className="mb-6">
                                        <strong>Ngày {conflict.date || 'N/A'}:</strong> Lớp hiện tại <strong className="text-warning-800">"{fullClassData?.name || 'N/A'}"</strong> 
                                        {' '}(<strong>{currentClassTime}</strong>) trùng với lớp <strong className="text-warning-800">"{conflict.className || 'N/A'}"</strong> 
                                        {' '}({conflict.time || conflict.teacherTime || 'N/A'})
                                      </li>
                                    );
                                  } catch (err) {
                                    console.error('Error rendering conflict item:', err, conflict);
                                    return (
                                      <li key={idx || `conflict-error-${idx}`} className="mb-6 text-danger">
                                        Lỗi hiển thị thông tin conflict
                                      </li>
                                    );
                                  }
                                })}
                            </ul>
                            <div className="mt-12 pt-12 border-top border-warning-300 text-11 text-warning-800">
                              <i className="fas fa-lightbulb me-2"></i>
                              <strong>Lưu ý:</strong> Bạn vẫn có thể chọn giáo viên này, nhưng sẽ có xung đột lịch học. Vui lòng xem xét kỹ trước khi lưu.
                            </div>
                          </div>
                        </details>
                      </div>
                    </Alert>
                  )}
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Phòng học</Form.Label>
                  {fullClassData?.status !== 'disable' ? (
                    <>
                      <div className="radius-8 px-16 py-10 text-neutral-700" style={{ lineHeight: '1.5' }}>
                        {rooms.find(r => (r._id || r.id) === formData.roomId)?.room_name ||
                         rooms.find(r => (r._id || r.id) === formData.roomId)?.name ||
                         'Chưa chọn phòng học'}
                      </div>
                      <Form.Text className="text-neutral-500 text-12">
                        Chỉ có thể sửa phòng học khi lớp ở trạng thái "Vô hiệu hóa".
                      </Form.Text>
                    </>
                  ) : (
                    <>
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
                        {checkingTeacherRoomConflicts
                          ? 'Đang kiểm tra xung đột...'
                          : rooms.length === 0
                          ? 'Đang tải danh sách phòng học...'
                          : `Có ${filteredRooms.length} phòng học. ${effectiveGeneratedSessions.length > 0 ? 'Chọn phòng học để kiểm tra xung đột lịch học.' : 'Chọn lịch học để kiểm tra xung đột.'}`}
                      </Form.Text>
                    </>
                  )}
                  {teacherRoomConflicts.roomConflicts.length > 0 && formData.roomId && 
                   teacherRoomConflicts.roomConflicts.some(c => c.roomId === (formData.roomId?.toString() || String(formData.roomId))) && (
                    <Alert variant="warning" className="mt-12 mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <strong> CẢNH BÁO XUNG ĐỘT LỊCH HỌC:</strong> Phòng học đã chọn có <strong>{teacherRoomConflicts.roomConflicts.filter(c => c.roomId === (formData.roomId?.toString() || String(formData.roomId))).length} xung đột</strong> với các lớp khác.
                      <div className="mt-8">
                        <details>
                          <summary className="cursor-pointer fw-medium text-13 mb-8">
                            <i className="fas fa-info-circle me-2"></i>
                            Xem chi tiết {teacherRoomConflicts.roomConflicts.filter(c => c.roomId === (formData.roomId?.toString() || String(formData.roomId))).length} xung đột
                          </summary>
                          <div className="mt-8 p-12 bg-warning-25 rounded-8 border border-warning-200">
                            <div className="text-12 fw-semibold mb-8 text-warning-900">
                              Phòng học này đang được sử dụng bởi các lớp khác vào cùng thời gian:
                            </div>
                            <ul className="mb-0 ms-16 text-12">
                              {teacherRoomConflicts.roomConflicts
                                .filter(c => {
                                  try {
                                    return c.roomId === (formData.roomId?.toString() || String(formData.roomId));
                                  } catch (err) {
                                    console.error('Error filtering room conflicts:', err);
                                    return false;
                                  }
                                })
                                // Remove duplicate conflicts based on unique key
                                .filter((conflict, index, self) => {
                                  const key = `${conflict.date}-${conflict.time || conflict.roomTime}-${conflict.className}`;
                                  return index === self.findIndex(c => 
                                    `${c.date}-${c.time || c.roomTime}-${c.className}` === key
                                  );
                                })
                                .map((conflict, idx) => {
                                  try {
                                    const currentClassTime = conflict.conflictingClassTime || 
                                      conflict.currentClassTime || 
                                      conflict.classTime || 
                                      conflict.time || 'N/A';
                                    
                                    return (
                                      <li key={idx || `conflict-${idx}`} className="mb-6">
                                        <strong>Ngày {conflict.date || 'N/A'}:</strong> Lớp hiện tại <strong className="text-warning-800">"{fullClassData?.name || 'N/A'}"</strong> 
                                        {' '}(<strong>{currentClassTime}</strong>) trùng với lớp <strong className="text-warning-800">"{conflict.className || 'N/A'}"</strong> 
                                        {' '}({conflict.time || 'N/A'})
                                      </li>
                                    );
                                  } catch (err) {
                                    console.error('Error rendering conflict item:', err, conflict);
                                    return (
                                      <li key={idx || `conflict-error-${idx}`} className="mb-6 text-danger">
                                        Lỗi hiển thị thông tin conflict
                                      </li>
                                    );
                                  }
                                })}
                            </ul>
                            <div className="mt-12 pt-12 border-top border-warning-300 text-11 text-warning-800">
                              <i className="fas fa-lightbulb me-2"></i>
                              <strong>Lưu ý:</strong> Bạn vẫn có thể chọn phòng học này, nhưng sẽ có xung đột lịch học. Vui lòng xem xét kỹ trước khi lưu.
                            </div>
                          </div>
                        </details>
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

          {/* Students Selection */}
          <div className="mb-24">
            <div className="d-flex justify-content-between align-items-center mb-16 pb-12 border-bottom border-neutral-100">
              <h5 className="text-neutral-900 fw-semibold mb-0">
                Học viên
              </h5>
              {selectedStudents && selectedStudents.length > 0 && (
                <div className="d-flex align-items-center gap-12">
                  <span className={`badge ${capacityWarning ? 'bg-danger' : 'bg-main-600'} text-white px-16 py-8 radius-8 text-14 fw-semibold`}>
                    Tổng cộng: {selectedStudents.length} học viên
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

            {checkingStudentConflicts && (
              <Alert variant="info" className="mb-16">
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang kiểm tra xung đột lịch học của học viên...
              </Alert>
            )}
            
            <div className="mb-16">
              <div className="d-flex justify-content-between align-items-center mb-12">
                <Form.Label className="text-neutral-700 fw-medium mb-0">
                  Danh sách học viên đã chọn
                </Form.Label>
                {/* Chỉ hiển thị nút thêm/import học viên khi trạng thái là disable */}
                {fullClassData?.status === 'disable' && (
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
                )}
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
                  {selectedStudents.length === 0 ? (
                    <div className="text-center text-neutral-500 py-40">
                      <i className="fas fa-user-slash fa-2x mb-12 text-neutral-300"></i>
                      <div className="text-14">Chưa có học viên nào được chọn</div>
                      <div className="text-12 mt-4">Nhấn "Thêm học viên" để chọn học viên cho lớp học</div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-8">
                      {selectedStudents.map(selectedStudentId => {
                        // Find student details from the students list or classStudents
                        const student = students.find(s => {
                          const studentId = s._id || s.id;
                          return String(studentId) === String(selectedStudentId);
                        }) || classStudents.find(s => {
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
                              {fullClassData?.status === 'disable' && (
                                <Button
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleRemoveStudent(selectedStudentId)}
                                  className="text-12 fw-medium px-12 py-6 radius-8"
                                >
                                  <i className="fas fa-times"></i>
                                </Button>
                              )}
                            </div>
                          );
                        }
                        
                        const displayName = student.fullName || student.name || student.username || student.email || 'N/A';
                        const email = student.email || 'N/A';
                        const username = student.username || 'N/A';
                        const phone = student.phone || 'N/A';
                        const studentIdStr = String(selectedStudentId);
                        const hasConflict = studentConflicts.has(studentIdStr);
                        const conflicts = hasConflict ? studentConflicts.get(studentIdStr) : [];
                        
                        return (
                          <div
                            key={selectedStudentId}
                            className={`d-flex align-items-center justify-content-between p-12 rounded-8 border ${
                              hasConflict ? 'border-warning bg-warning-50' : 'border-main-200 bg-main-50'
                            }`}
                          >
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-8">
                                <div className="fw-medium text-neutral-900 text-14">
                                  {displayName}
                                </div>
                                {hasConflict && (
                                  <span 
                                    className="badge bg-warning text-dark px-8 py-4 radius-6 text-11"
                                    title={`Có ${conflicts.length} xung đột lịch học`}
                                  >
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    {conflicts.length} xung đột
                                  </span>
                                )}
                              </div>
                              <div className="text-12 text-neutral-500">
                                {email} {username && `• ${username}`} {phone && phone !== 'N/A' && `• ${phone}`}
                              </div>
                              {hasConflict && conflicts.length > 0 && (
                                <div className="mt-8 text-12 text-warning-800">
                                  <details>
                                    <summary className="cursor-pointer fw-medium">
                                      Xem chi tiết xung đột ({conflicts.length})
                                    </summary>
                                    <ul className="mt-8 mb-0 ms-16">
                                      {conflicts.map((conflict, idx) => (
                                        <li key={idx} className="mb-4">
                                          Lớp <strong>{conflict.className}</strong> vào {conflict.dateDisplay} 
                                          ({conflict.time}) trùng với lịch mới ({conflict.newClassTime})
                                        </li>
                                      ))}
                                    </ul>
                                  </details>
                                </div>
                              )}
                            </div>
                            {/* Hiển thị nút xóa khi trạng thái là disable */}
                            {fullClassData?.status === 'disable' && (
                              <Button
                                type="button"
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveStudent(selectedStudentId)}
                                className="text-12 fw-medium px-12 py-6 radius-8"
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              <Form.Text className="text-neutral-500 text-12 mt-8">
                <i className="fas fa-info-circle me-1"></i>
                Có thể thêm học viên sau khi chỉnh sửa lớp. File Excel cần có cột đầu tiên chứa Email của học viên.
              </Form.Text>
            </div>
          </div>
          </Card.Body>
        </Card>

        {/* Action Buttons */}
        <div className="d-flex justify-content-between align-items-center gap-12 mt-24">
          <div>
            {fullClassData?.status === 'disable' && onDelete && (
              <Button
                variant="outline-danger"
                className="text-15 fw-medium px-24 py-12 radius-8"
                onClick={() => onDelete(classId || formData.id)}
              >
                <i className="fas fa-trash me-2"></i>
                Xóa lớp học
              </Button>
            )}
          </div>
          <div className="d-flex gap-12">
            <Button 
              variant="outline-secondary"
              className="text-15 fw-medium px-24 py-12 radius-8"
              onClick={handleBack}
            >
              <i className="fas fa-times me-2"></i>
              Hủy
            </Button>
            <Button 
              variant="warning"
              className="text-white text-15 fw-semibold px-24 py-12 radius-8"
              type="submit"
              disabled={
                scheduleEntriesError || 
                duplicateEntryIndices.length > 0 ||
                teacherRoomConflicts.teacherConflicts.length > 0 ||
                teacherRoomConflicts.roomConflicts.length > 0 ||
                studentConflicts.size > 0
              }
            >
              <i className="fas fa-save me-2"></i>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Form>

      {/* Select Student Modal */}
      <SelectStudentModal
        show={showSelectStudentModal}
        onClose={() => setShowSelectStudentModal(false)}
        onConfirm={handleStudentsConfirmed}
        initialSelectedStudents={selectedStudents}
        generatedSessions={generatedSessions}
        courseId={formData.course || fullClassData?.course?._id || fullClassData?.course?.id || fullClassData?.course || null}
        currentClassId={formData.id || fullClassData?._id || classId || null}
        currentClassName={fullClassData?.name || formData.name || null}
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
                <div className="mb-16">
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

              {importResult?.invalidStudents && importResult.invalidStudents.length > 0 && (
                <div className="mb-0">
                  <Alert variant="warning" className="mb-8">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>
                      {importResult.invalidStudents.length} học viên chưa đăng ký khóa học
                      {importResult.courseName && ` "${importResult.courseName}"`}
                    </strong>
                  </Alert>
                  <div className="text-neutral-700 fw-medium mb-8">
                    <i className="fas fa-user-times me-2"></i>
                    Danh sách học viên chưa đăng ký:
                  </div>
                  <div 
                    className="border border-warning rounded-8 p-12 bg-warning-25"
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                  >
                    <div className="d-flex flex-column gap-4">
                      {importResult.invalidStudents.slice(0, 20).map((student, index) => (
                        <div key={student.studentId || index} className="text-neutral-700 text-13">
                          • <strong>{student.studentName}</strong>
                          <span className="text-neutral-500 text-12 ms-2">
                            ({student.reason || 'Chưa đăng ký khóa học'})
                          </span>
                        </div>
                      ))}
                      {importResult.invalidStudents.length > 20 && (
                        <div className="text-neutral-500 text-12 mt-4">
                          ... và {importResult.invalidStudents.length - 20} học viên khác
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-neutral-600 text-12 mt-8">
                    <i className="fas fa-info-circle me-2"></i>
                    Các học viên này sẽ không được thêm vào lớp. Vui lòng đăng ký khóa học cho họ trước.
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

      {/* Schedule Detail Modal */}
      <Modal 
        show={showScheduleDetailModal} 
        onHide={() => {
          setShowScheduleDetailModal(false);
          setSelectedScheduleDetail(null);
          setEditedSchedule(null);
          setHasAttendance(false);
          setCheckingAttendance(false);
          setScheduleValidationResult(null);
        }} 
        centered
        size="md"
        onShow={async () => {
          // Reset validation result when modal opens
          setScheduleValidationResult(null);
          
          // Initialize editedSchedule when modal opens
          if (selectedScheduleDetail) {
            setEditedSchedule({
              date: selectedScheduleDetail.date,
              startTime: selectedScheduleDetail.startTime,
              endTime: selectedScheduleDetail.endTime,
              roomId: selectedScheduleDetail.roomId || selectedScheduleDetail.room?._id || selectedScheduleDetail.room?.id || formData.roomId
            });
            
            // Check if schedule has attendance (buổi đã học)
            const scheduleId = selectedScheduleDetail.id || selectedScheduleDetail._id;
            if (scheduleId && !scheduleId.startsWith('generated-') && !scheduleId.startsWith('schedule-')) {
              try {
                setCheckingAttendance(true);
                const response = await classScheduleService.getAttendanceByClassSchedule(scheduleId);
                const attendances = response.list || response.attendances || response || [];
                
                // Check if any student has attendance (status is not null/undefined)
                const hasAnyAttendance = attendances.some(att => att.attendance?.status != null);
                setHasAttendance(hasAnyAttendance);
              } catch (error) {
                console.error('Error checking attendance:', error);
                // If error, assume no attendance (allow editing)
                setHasAttendance(false);
              } finally {
                setCheckingAttendance(false);
              }
            } else {
              // Generated schedule, no attendance yet
              setHasAttendance(false);
            }
          }
        }}
      >
        <Modal.Header closeButton className="bg-main-600 text-white border-0 p-24">
          <Modal.Title className="fw-bold">
            <i className="fas fa-calendar-day me-2"></i>
            Thông tin buổi học
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-24">
          {checkingAttendance && (
            <div className="text-center py-20">
              <div className="spinner-border text-main-600" role="status">
                <span className="visually-hidden">Đang kiểm tra...</span>
              </div>
              <p className="text-neutral-600 mt-3">Đang kiểm tra trạng thái buổi học...</p>
            </div>
          )}
          {!checkingAttendance && selectedScheduleDetail && editedSchedule && (
            <div className="d-flex flex-column gap-16">
              {(hasAttendance || isPastSchedule) && (
                <Alert variant="warning" className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {isPastSchedule ? 'Buổi học đã qua, chỉ có thể xem thông tin.' : 'Buổi học đã diễn ra, không thể chỉnh sửa thông tin.'}
                </Alert>
              )}

              
              {validatingScheduleEdit && (
                <Alert variant="info" className="mb-0">
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Đang kiểm tra xung đột lịch học...
                </Alert>
              )}
              
              {!validatingScheduleEdit && scheduleValidationResult && scheduleValidationResult.conflicts?.hasConflict &&
               ((scheduleValidationResult.conflicts.teacher && scheduleValidationResult.conflicts.teacher.length > 0) ||
                (scheduleValidationResult.conflicts.room && scheduleValidationResult.conflicts.room.filter(c => !c.isCurrentClass).length > 0) ||
                (scheduleValidationResult.conflicts.students && scheduleValidationResult.conflicts.students.length > 0) ||
                (scheduleValidationResult.conflicts.auditingStudents && scheduleValidationResult.conflicts.auditingStudents.length > 0)) && (
                <Alert variant="danger" className="mb-0">
                  <div className="fw-semibold mb-8">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    Phát hiện xung đột lịch học:
                  </div>
                  
                  {scheduleValidationResult.conflicts.teacher && scheduleValidationResult.conflicts.teacher.length > 0 && (
                    <div className="mb-8">
                      <div className="fw-medium mb-4">Xung đột với giáo viên:</div>
                      <ul className="mb-0 ps-16">
                        {scheduleValidationResult.conflicts.teacher.map((conflict, idx) => (
                          <li key={idx} className="text-13">
                            Giáo viên đã có lớp <strong>{conflict.className}</strong> vào {conflict.date} lúc {conflict.time}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {scheduleValidationResult.conflicts.room && scheduleValidationResult.conflicts.room.filter(c => !c.isCurrentClass).length > 0 && (
                    <div className="mb-8">
                      <div className="fw-medium mb-4">Xung đột với phòng học:</div>
                      <ul className="mb-0 ps-16">
                        {scheduleValidationResult.conflicts.room
                          .filter(c => !c.isCurrentClass)
                          .map((conflict, idx) => (
                            <li key={idx} className="text-13">
                              Phòng đã được sử dụng bởi lớp <strong>{conflict.className}</strong> vào {conflict.date} lúc {conflict.time}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                  
                  {scheduleValidationResult.conflicts.students && scheduleValidationResult.conflicts.students.length > 0 && (
                    <div className="mb-8">
                      <div className="fw-medium mb-4">Xung đột với học viên:</div>
                      <ul className="mb-0 ps-16">
                        {scheduleValidationResult.conflicts.students.map((studentConflict, idx) => (
                          <li key={idx} className="text-13 mb-4">
                            <strong>{studentConflict.studentName}</strong> đã có lớp:
                            <ul className="ps-16 mt-2 mb-0">
                              {studentConflict.conflicts.map((conflict, cIdx) => (
                                <li key={cIdx} className="text-12">
                                  <strong>{conflict.className}</strong> vào {conflict.date} lúc {conflict.time}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {scheduleValidationResult.conflicts.auditingStudents && scheduleValidationResult.conflicts.auditingStudents.length > 0 && (
                    <div className="mb-0">
                      <div className="d-flex align-items-center gap-8 mb-2">
                        <i className="fas fa-exclamation-triangle text-warning-600"></i>
                        <span className="fw-semibold text-14">
                          Học sinh học tạm thời bị ảnh hưởng:
                        </span>
                      </div>
                      {scheduleValidationResult.conflicts.auditingStudents.map((conflict, idx) => (
                        <div key={idx} className="bg-warning-50 border border-warning-200 rounded-8 p-12 mb-2">
                          <div className="text-warning-900 text-13 mb-2">
                            {conflict.message}
                          </div>
                          <div className="text-warning-700 text-12">
                            <strong>Danh sách học sinh:</strong> {conflict.auditingStudents.join(', ')}
                          </div>
                          <div className="text-warning-700 text-12 mt-1">
                            <strong>Session:</strong> {conflict.originalSessionOrder} → {conflict.newSessionOrder}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Alert>
              )}
              
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="text-neutral-700 fw-medium mb-8">
                      Ngày học
                    </Form.Label>
                    {isPastSchedule ? (
                      <div className="text-neutral-900 fw-semibold text-15">
                        {(() => {
                          const [year, month, day] = editedSchedule.date.split('-');
                          return `${day}/${month}/${year}`;
                        })()}
                      </div>
                    ) : (
                      <Form.Control
                        type="date"
                        value={editedSchedule.date}
                        onChange={(e) => setEditedSchedule({
                          ...editedSchedule,
                          date: e.target.value
                        })}
                        min={new Date().toISOString().split('T')[0]}
                        className="border-neutral-30 radius-8 px-16 py-10"
                        disabled={hasAttendance || checkingAttendance || fullClassData?.status !== 'disable'}
                      />
                    )}
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <div className="text-neutral-600 text-13 fw-medium mb-8">
                    Thứ
                  </div>
                  <div className="text-neutral-900 fw-semibold text-15">
                    {(() => {
                      const date = new Date(editedSchedule.date);
                      const dayOfWeek = date.getDay();
                      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                      return dayNames[dayOfWeek];
                    })()}
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="text-neutral-700 fw-medium mb-8">
                      Giờ bắt đầu
                    </Form.Label>
                    {isPastSchedule ? (
                      <div className="text-neutral-900 fw-semibold text-15">
                        {editedSchedule.startTime}
                      </div>
                    ) : (
                      <>
                        <Form.Control
                          type="time"
                          value={editedSchedule.startTime}
                          max={editedSchedule.endTime || '23:59'}
                          onChange={(e) => {
                            const newStartTime = e.target.value;
                            // Validate: startTime must be less than endTime
                            if (editedSchedule.endTime && newStartTime >= editedSchedule.endTime) {
                              Swal.fire({
                                icon: 'warning',
                                title: 'Thông tin không hợp lệ',
                                text: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc!',
                                timer: 2000,
                                showConfirmButton: false
                              });
                              return;
                            }
                            setEditedSchedule({
                              ...editedSchedule,
                              startTime: newStartTime
                            });
                          }}
                          className="border-neutral-30 radius-8 px-16 py-10"
                          disabled={hasAttendance || checkingAttendance || fullClassData?.status !== 'disable'}
                        />
                        {editedSchedule.startTime && editedSchedule.endTime && editedSchedule.startTime >= editedSchedule.endTime && (
                          <Form.Text className="text-danger text-12 mt-1">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            Giờ bắt đầu phải nhỏ hơn giờ kết thúc
                          </Form.Text>
                        )}
                      </>
                    )}
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="text-neutral-700 fw-medium mb-8">
                      Giờ kết thúc
                    </Form.Label>
                    {isPastSchedule ? (
                      <div className="text-neutral-900 fw-semibold text-15">
                        {editedSchedule.endTime}
                      </div>
                    ) : (
                      <>
                        <Form.Control
                          type="time"
                          value={editedSchedule.endTime}
                          min={editedSchedule.startTime || '00:00'}
                          onChange={(e) => {
                            const newEndTime = e.target.value;
                            // Validate: endTime must be greater than startTime
                            if (editedSchedule.startTime && newEndTime <= editedSchedule.startTime) {
                              Swal.fire({
                                icon: 'warning',
                                title: 'Thông tin không hợp lệ',
                                text: 'Giờ kết thúc phải lớn hơn giờ bắt đầu!',
                                timer: 2000,
                                showConfirmButton: false
                              });
                              return;
                            }
                            setEditedSchedule({
                              ...editedSchedule,
                              endTime: newEndTime
                            });
                          }}
                          className="border-neutral-30 radius-8 px-16 py-10"
                          disabled={hasAttendance || checkingAttendance || fullClassData?.status !== 'disable'}
                        />
                        {editedSchedule.startTime && editedSchedule.endTime && editedSchedule.endTime <= editedSchedule.startTime && (
                          <Form.Text className="text-danger text-12 mt-1">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            Giờ kết thúc phải lớn hơn giờ bắt đầu
                          </Form.Text>
                        )}
                      </>
                    )}
                  </Form.Group>
                </div>
              </div>

              {selectedScheduleDetail.className && (
                <div>
                  <div className="text-neutral-600 text-13 fw-medium mb-8">
                    Lớp học
                  </div>
                  <div className="text-neutral-900 fw-semibold text-15">
                    {selectedScheduleDetail.className}
                  </div>
                </div>
              )}

              {selectedScheduleDetail.teacherName && selectedScheduleDetail.teacherName !== 'Chưa có' && (
                <div>
                  <div className="text-neutral-600 text-13 fw-medium mb-8">
                    Giáo viên
                  </div>
                  <div className="text-neutral-900 text-15">
                    {selectedScheduleDetail.teacherName}
                  </div>
                </div>
              )}

              <div>
                <Form.Group>
                  <Form.Label className="text-neutral-600 text-13 fw-medium mb-8">
                    Phòng học
                  </Form.Label>
                  {(hasAttendance || isPastSchedule) ? (
                    <div className="text-neutral-900 text-15">
                      {selectedScheduleDetail.roomName || 'Chưa có'}
                    </div>
                  ) : (
                    <Form.Select
                      value={editedSchedule?.roomId || ''}
                      onChange={(e) => {
                        setEditedSchedule(prev => ({
                          ...prev,
                          roomId: e.target.value
                        }));
                      }}
                      className="border-neutral-30 radius-8 px-16 py-10"
                      disabled={hasAttendance || fullClassData?.status !== 'disable'}
                    >
                      <option value="">-- Chọn phòng học --</option>
                      {filteredRooms.map(room => {
                        const roomId = room._id || room.id;
                        const roomName = room.name || room.roomName || room.room_name || `Phòng ${roomId}`;
                        const capacity = room.capacity || room.maxCapacity || room.maxStudents || 'N/A';
                        return (
                          <option key={roomId} value={roomId}>
                            {roomName} (Sức chứa: {capacity})
                          </option>
                        );
                      })}
                    </Form.Select>
                  )}
                </Form.Group>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-neutral-25 border-0 p-20">
          <Button
            className="btn-outline-neutral text-15 fw-medium px-20 py-10 radius-8"
            onClick={() => {
              setShowScheduleDetailModal(false);
              setSelectedScheduleDetail(null);
              setEditedSchedule(null);
            }}
            disabled={savingSchedule}
          >
            <i className="fas fa-times me-2"></i> {isPastSchedule ? 'Đóng' : 'Hủy'}
          </Button>
          {!isPastSchedule && (
          <Button
            className="btn-main text-15 fw-semibold px-24 py-10 radius-8"
            disabled={!hasScheduleChanges || hasAttendance || checkingAttendance || savingSchedule || validatingScheduleEdit || fullClassData?.status !== 'disable' ||
              (scheduleValidationResult?.conflicts?.hasConflict === true &&
               ((scheduleValidationResult.conflicts.teacher && scheduleValidationResult.conflicts.teacher.length > 0) ||
                (scheduleValidationResult.conflicts.room && scheduleValidationResult.conflicts.room.filter(c => !c.isCurrentClass).length > 0) ||
                (scheduleValidationResult.conflicts.students && scheduleValidationResult.conflicts.students.length > 0) ||
                (scheduleValidationResult.conflicts.auditingStudents && scheduleValidationResult.conflicts.auditingStudents.length > 0)))}
            onClick={async () => {
              if (!editedSchedule || !selectedScheduleDetail) return;
              
              // Prevent saving if has attendance
              if (hasAttendance) {
                await Swal.fire({
                  icon: 'warning',
                  title: 'Không thể chỉnh sửa',
                  text: 'Buổi học đã diễn ra, không thể chỉnh sửa!'
                });
                return;
              }
              
              // Validate
              if (!editedSchedule.date || !editedSchedule.startTime || !editedSchedule.endTime) {
                await Swal.fire({
                  icon: 'warning',
                  title: 'Thiếu thông tin',
                  text: 'Vui lòng điền đầy đủ thông tin!'
                });
                return;
              }
              
              if (editedSchedule.startTime >= editedSchedule.endTime) {
                await Swal.fire({
                  icon: 'warning',
                  title: 'Thông tin không hợp lệ',
                  text: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc!'
                });
                return;
              }
              
              // Check for conflicts
              if (scheduleValidationResult?.conflicts?.hasConflict) {
                await Swal.fire({
                  icon: 'error',
                  title: 'Xung đột lịch học',
                  text: 'Không thể lưu do có xung đột lịch học. Vui lòng kiểm tra lại!'
                });
                return;
              }

              // Check if schedule has real ID (from database)
              const scheduleId = selectedScheduleDetail.id;
              if (!scheduleId || scheduleId.startsWith('generated-') || scheduleId.startsWith('schedule-')) {
                await Swal.fire({
                  icon: 'warning',
                  title: 'Không thể chỉnh sửa',
                  text: 'Buổi học này chưa được lưu vào hệ thống. Vui lòng lưu lớp học trước khi chỉnh sửa buổi học.'
                });
                return;
              }

              // Show confirmation modal
              setShowConfirmUpdateModal(true);
            }}
          >
            {savingSchedule ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Lưu thay đổi
              </>
            )}
          </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Confirm Update Scope Modal */}
      <Modal 
        show={showConfirmUpdateModal} 
        onHide={() => {
          setShowConfirmUpdateModal(false);
          setUpdateScope('single');
          setConfirmUpdateValidationResult(null);
        }} 
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-warning-50 border-0 p-24">
          <Modal.Title className="fw-bold text-neutral-900">
            <i className="fas fa-exclamation-triangle text-warning-600 me-2"></i>
            Xác nhận chỉnh sửa
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-24">
          <div className="mb-20">
            <h5 className="text-neutral-900 fw-semibold mb-12">Bạn muốn chỉnh sửa buổi học này</h5>
            <p className="text-neutral-600 text-14 mb-0">
              Vui lòng chọn phạm vi áp dụng thay đổi:
            </p>
          </div>

          <div className="d-flex flex-column gap-12">
            <div 
              className={`border rounded-12 p-16 cursor-pointer transition-all ${
                updateScope === 'single' 
                  ? 'border-main-500 bg-main-50' 
                  : 'border-neutral-200 bg-white hover-border-neutral-300'
              }`}
              onClick={() => setUpdateScope('single')}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center gap-12">
                <div 
                  className={`rounded-circle d-flex align-items-center justify-content-center ${
                    updateScope === 'single' ? 'bg-main-600' : 'border border-neutral-300 bg-white'
                  }`}
                  style={{ width: '20px', height: '20px', flexShrink: 0 }}
                >
                  {updateScope === 'single' && (
                    <i className="fas fa-check text-white" style={{ fontSize: '10px' }}></i>
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className="text-neutral-900 fw-semibold text-15 mb-4">Chỉ buổi học này</div>
                </div>
              </div>
            </div>

            <div 
              className={`border rounded-12 p-16 cursor-pointer transition-all ${
                updateScope === 'future' 
                  ? 'border-main-500 bg-main-50' 
                  : 'border-neutral-200 bg-white hover-border-neutral-300'
              }`}
              onClick={() => setUpdateScope('future')}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center gap-12">
                <div 
                  className={`rounded-circle d-flex align-items-center justify-content-center ${
                    updateScope === 'future' ? 'bg-main-600' : 'border border-neutral-300 bg-white'
                  }`}
                  style={{ width: '20px', height: '20px', flexShrink: 0 }}
                >
                  {updateScope === 'future' && (
                    <i className="fas fa-check text-white" style={{ fontSize: '10px' }}></i>
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className="text-neutral-900 fw-semibold text-15 mb-4">Buổi học này và các buổi học sau</div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Result Display */}
          {validatingConfirmUpdate && (
            <div className="mt-20">
              <div className="d-flex align-items-center text-neutral-600 text-14">
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang kiểm tra xung đột lịch học...
              </div>
            </div>
          )}

          {confirmUpdateValidationResult && !validatingConfirmUpdate && (
            <div className="mt-20">
              {confirmUpdateValidationResult.hasConflict ? (
                <Alert variant="danger" className="mb-0">
                  <div className="fw-semibold mb-8">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Có xung đột lịch học được phát hiện:
                  </div>

                  {confirmUpdateValidationResult.conflicts.room && confirmUpdateValidationResult.conflicts.room.length > 0 && (
                    <div className="mb-8">
                      <div className="fw-medium mb-4">🔴 Xung đột Phòng học:</div>
                      <ul className="mb-0 ps-16">
                        {confirmUpdateValidationResult.conflicts.room.map((conflict, idx) => (
                          <li key={idx} className="text-13">
                            {conflict.isCurrentClass ? (
                              <>
                                <strong>Lớp này đã có buổi học</strong> vào {conflict.date} từ {conflict.time}.
                                Một lớp không thể có 2 buổi học cùng thứ cùng giờ.
                              </>
                            ) : (
                              <>
                                Lớp <strong>{conflict.className}</strong> vào {conflict.date} từ {conflict.time}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {confirmUpdateValidationResult.conflicts.teacher && confirmUpdateValidationResult.conflicts.teacher.length > 0 && (
                    <div className="mb-8">
                      <div className="fw-medium mb-4">🔴 Xung đột Giáo viên:</div>
                      <ul className="mb-0 ps-16">
                        {confirmUpdateValidationResult.conflicts.teacher.map((conflict, idx) => (
                          <li key={idx} className="text-13">
                            Lớp <strong>{conflict.className}</strong> vào {conflict.date} từ {conflict.time}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {confirmUpdateValidationResult.conflicts.students && confirmUpdateValidationResult.conflicts.students.length > 0 && (
                    <div className="mb-8">
                      <div className="fw-medium mb-4">🔴 Xung đột Học sinh:</div>
                      {confirmUpdateValidationResult.conflicts.students.map((studentConflict, idx) => (
                        <div key={idx} className="mb-4">
                          <div className="fw-medium text-13 mb-2">
                            Học sinh: <strong>{studentConflict.studentName}</strong>
                          </div>
                          <ul className="mb-0 ps-16">
                            {studentConflict.conflicts.map((conflict, cIdx) => (
                              <li key={cIdx} className="text-13">
                                Lớp <strong>{conflict.className}</strong> vào {conflict.date} từ {conflict.time}
                                {conflict.isAuditing && <span className="text-warning-600 ms-2">(Học tạm thời)</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {confirmUpdateValidationResult.conflicts.auditingStudents && confirmUpdateValidationResult.conflicts.auditingStudents.length > 0 && (
                    <div className="mb-8">
                      <div className="fw-medium mb-4">⚠️ Vấn đề Session:</div>
                      {confirmUpdateValidationResult.conflicts.auditingStudents.map((auditConflict, idx) => (
                        <div key={idx} className="mb-4">
                          <div className="text-13 mb-2">
                            {auditConflict.message}
                          </div>
                          <div className="text-13 text-neutral-600">
                            <strong>Buổi học:</strong> {auditConflict.scheduleDate ? formatDate(auditConflict.scheduleDate) : 'N/A'}<br/>
                            <strong>Session cũ:</strong> {auditConflict.originalSessionOrder}<br/>
                            <strong>Session mới:</strong> {auditConflict.newSessionOrder}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {confirmUpdateValidationResult.allConflicts && confirmUpdateValidationResult.allConflicts.length > 0 && (
                    <div className="mb-8">
                      <div className="fw-medium mb-4">📋 Tổng hợp xung đột cho các buổi học:</div>
                      {confirmUpdateValidationResult.allConflicts.map((scheduleConflict, idx) => (
                        <div key={idx} className="mb-4 p-12 bg-neutral-50 rounded-8">
                          <div className="fw-medium text-13 mb-2">
                            Buổi học ngày {scheduleConflict.date}:
                          </div>
                          {scheduleConflict.conflicts.room && scheduleConflict.conflicts.room.length > 0 && (
                            <div className="text-13 mb-2">
                              - Xung đột phòng: {scheduleConflict.conflicts.room.length} xung đột
                            </div>
                          )}
                          {scheduleConflict.conflicts.teacher && scheduleConflict.conflicts.teacher.length > 0 && (
                            <div className="text-13 mb-2">
                              - Xung đột giáo viên: {scheduleConflict.conflicts.teacher.length} xung đột
                            </div>
                          )}
                          {scheduleConflict.conflicts.students && scheduleConflict.conflicts.students.length > 0 && (
                            <div className="text-13 mb-2">
                              - Xung đột học sinh: {scheduleConflict.conflicts.students.length} học sinh
                            </div>
                          )}
                          {scheduleConflict.conflicts.auditingStudents && scheduleConflict.conflicts.auditingStudents.length > 0 && (
                            <div className="text-13 mb-2 text-warning-600">
                              - Vấn đề session: {scheduleConflict.conflicts.auditingStudents.length} vấn đề
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Alert>
              ) : (
                <Alert variant="success" className="mb-0">
                  <i className="fas fa-check-circle me-2"></i>
                  Không có xung đột lịch học
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-neutral-25 border-0 p-20">
          <Button 
            className="btn-outline-neutral text-15 fw-medium px-20 py-10 radius-8"
            onClick={() => {
              setShowConfirmUpdateModal(false);
              setUpdateScope('single');
              setConfirmUpdateValidationResult(null);
            }}
            disabled={validatingConfirmUpdate || savingSchedule}
          >
            <i className="fas fa-times me-2"></i> Hủy
          </Button>
          <Button 
            className="btn-main text-15 fw-semibold px-24 py-10 radius-8"
            disabled={validatingConfirmUpdate || savingSchedule || (confirmUpdateValidationResult?.hasConflict === true)}
            onClick={async () => {
              if (!editedSchedule || !selectedScheduleDetail) return;

              try {
                // Nếu updateScope='future', validate trước
                if (updateScope === 'future') {
                  try {
                    setValidatingConfirmUpdate(true);
                    setConfirmUpdateValidationResult(null);

                    const classId = formData.id || formData._id;
                    if (!classId) {
                      await Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Không tìm thấy ID lớp học'
                      });
                      setValidatingConfirmUpdate(false);
                      return;
                    }

                    const roomId = formData.roomId || fullClassData?.room?._id || fullClassData?.room?.id;
                    if (!roomId) {
                      await Swal.fire({
                        icon: 'warning',
                        title: 'Thiếu thông tin',
                        text: 'Lớp học chưa có phòng học được gán'
                      });
                      setValidatingConfirmUpdate(false);
                      return;
                    }

                    const scheduleId = selectedScheduleDetail.id;
                    
                    // Lấy thông tin schedule hiện tại từ fullClassData
                    let currentSchedule = null;
                    if (fullClassData?.schedules) {
                      currentSchedule = fullClassData.schedules.find(s => {
                        const sId = s._id || s.id;
                        return String(sId) === String(scheduleId);
                      });
                    }

                    if (!currentSchedule) {
                      // Fallback: lấy từ selectedScheduleDetail
                      currentSchedule = {
                        date: selectedScheduleDetail.date,
                        startTime: selectedScheduleDetail.startTime,
                        endTime: selectedScheduleDetail.endTime
                      };
                    }

                    const currentDate = new Date(currentSchedule.date);
                    currentDate.setHours(0, 0, 0, 0);
                    const currentDayOfWeek = currentDate.getDay();
                    const currentStartTime = currentSchedule.startTime;
                    const currentEndTime = currentSchedule.endTime;

                    // Lấy tất cả schedules của lớp từ fullClassData
                    const allSchedules = fullClassData?.schedules || [];
                    const matchingSchedules = allSchedules.filter(s => {
                      const sDate = new Date(s.date);
                      sDate.setHours(0, 0, 0, 0);
                      const sDayOfWeek = sDate.getDay();
                      return sDayOfWeek === currentDayOfWeek &&
                             s.startTime === currentStartTime &&
                             s.endTime === currentEndTime &&
                             sDate >= currentDate;
                    });

                    if (matchingSchedules.length === 0) {
                      await Swal.fire({
                        icon: 'warning',
                        title: 'Không tìm thấy',
                        text: 'Không tìm thấy buổi học nào có cùng pattern để cập nhật'
                      });
                      setValidatingConfirmUpdate(false);
                      return;
                    }

                    console.log(`Tìm thấy ${matchingSchedules.length} buổi học có cùng pattern`);

                    // Validate từng buổi matching
                    const allConflicts = [];
                    let hasAnyConflict = false;
                    const aggregatedConflicts = {
                      room: [],
                      teacher: [],
                      students: [],
                      auditingStudents: [],
                      hasConflict: false
                    };

                    const firstScheduleDate = new Date(matchingSchedules[0]?.date || currentDate);
                    firstScheduleDate.setHours(0, 0, 0, 0);

                    const newDate = new Date(editedSchedule.date);
                    newDate.setHours(0, 0, 0, 0);

                    for (const matchingSchedule of matchingSchedules) {
                      const originalDate = new Date(matchingSchedule.date);
                      originalDate.setHours(0, 0, 0, 0);
                      
                      // Tính toán date mới dựa trên pattern (tương tự backend logic)
                      const daysFromFirst = Math.floor((originalDate.getTime() - firstScheduleDate.getTime()) / (24 * 60 * 60 * 1000));
                      const weeksFromFirst = Math.floor(daysFromFirst / 7);
                      
                      const newScheduleDate = new Date(newDate);
                      newScheduleDate.setDate(newDate.getDate() + (weeksFromFirst * 7));
                      newScheduleDate.setHours(0, 0, 0, 0);
                      
                      const newScheduleDateStr = formatDateToYYYYMMDD(newScheduleDate);

                      const scheduleIdToExclude = matchingSchedule._id || matchingSchedule.id;

                      try {
                        const validationResult = await classScheduleService.validateAddClassSchedule({
                          classId: classId,
                          date: newScheduleDateStr,
                          startTime: editedSchedule.startTime,
                          endTime: editedSchedule.endTime,
                          room: roomId,
                          excludeScheduleId: scheduleIdToExclude
                        });

                        if (validationResult.conflicts?.hasConflict) {
                          hasAnyConflict = true;
                          allConflicts.push({
                            scheduleId: scheduleIdToExclude,
                            date: newScheduleDateStr,
                            conflicts: validationResult.conflicts
                          });

                          // Aggregate conflicts
                          if (validationResult.conflicts.room) {
                            aggregatedConflicts.room.push(...validationResult.conflicts.room);
                          }
                          if (validationResult.conflicts.teacher) {
                            aggregatedConflicts.teacher.push(...validationResult.conflicts.teacher);
                          }
                          if (validationResult.conflicts.students) {
                            aggregatedConflicts.students.push(...validationResult.conflicts.students);
                          }
                          if (validationResult.conflicts.auditingStudents) {
                            // Thêm date vào mỗi auditingStudents conflict
                            validationResult.conflicts.auditingStudents.forEach(auditConflict => {
                              aggregatedConflicts.auditingStudents.push({
                                ...auditConflict,
                                scheduleDate: newScheduleDateStr, // Date mới sau khi tính toán
                                originalScheduleDate: formatDateToYYYYMMDD(originalDate) // Date gốc
                              });
                            });
                          }
                        }
                      } catch (error) {
                        console.error(`Error validating schedule ${scheduleIdToExclude}:`, error);
                        hasAnyConflict = true;
                        allConflicts.push({
                          scheduleId: scheduleIdToExclude,
                          date: newScheduleDateStr,
                          conflicts: { hasConflict: true, error: error.message }
                        });
                      }
                    }

                    aggregatedConflicts.hasConflict = hasAnyConflict;

                    setConfirmUpdateValidationResult({
                      hasConflict: hasAnyConflict,
                      conflicts: aggregatedConflicts,
                      allConflicts: allConflicts
                    });

                    setValidatingConfirmUpdate(false);

                    // Nếu có conflict, dừng lại và không update
                    if (hasAnyConflict) {
                      return;
                    }
                  } catch (error) {
                    console.error('Error validating future schedules:', error);
                    await Swal.fire({
                      icon: 'error',
                      title: 'Lỗi',
                      text: 'Có lỗi xảy ra khi kiểm tra xung đột. Vui lòng thử lại.'
                    });
                    setValidatingConfirmUpdate(false);
                    return;
                  }
                }

                // Nếu không có conflict hoặc updateScope='single', lưu vào pendingScheduleChanges
                const scheduleId = selectedScheduleDetail.id;
                
                // Prepare old schedule data
                const oldRoomId = selectedScheduleDetail.roomId || selectedScheduleDetail.room?._id || selectedScheduleDetail.room?.id;
                const oldSchedule = {
                  date: selectedScheduleDetail.date,
                  startTime: selectedScheduleDetail.startTime,
                  endTime: selectedScheduleDetail.endTime,
                  roomId: oldRoomId
                };

                // Prepare new schedule data
                const newSchedule = {
                  date: editedSchedule.date,
                  startTime: editedSchedule.startTime,
                  endTime: editedSchedule.endTime,
                  roomId: editedSchedule.roomId
                };

                // Check if only room changed (date and time are the same)
                const isRoomChangeOnly = oldSchedule.date === newSchedule.date &&
                                        oldSchedule.startTime === newSchedule.startTime &&
                                        oldSchedule.endTime === newSchedule.endTime &&
                                        oldSchedule.roomId !== newSchedule.roomId;

                console.log(' Lưu tạm thời thay đổi buổi học:');
                console.log('  - ScheduleId:', scheduleId);
                console.log('  - UpdateScope:', updateScope);
                console.log('  - Old Schedule:', oldSchedule);
                console.log('  - New Schedule:', newSchedule);

                // Log all teacher schedules on the new schedule date
                console.log('🔍 DEBUG: Bắt đầu lấy lịch giáo viên cho ngày', newSchedule.date);
                (async () => {
                  try {
                    console.log('🔍 DEBUG: Gọi teacherService.getAllTeachers()');
                    const teachersResponse = await teacherService.getAllTeachers();
                    console.log('🔍 DEBUG: teachersResponse:', teachersResponse);

                    if (teachersResponse && teachersResponse.teachers && teachersResponse.teachers.length > 0) {
                      console.log(`📅 Lịch dạy của tất cả giáo viên vào ngày ${newSchedule.date}:`);
                      console.log('🔍 DEBUG: Tổng số giáo viên:', teachersResponse.teachers.length);

                      const teacherSchedulesPromises = teachersResponse.teachers.map(async (teacher, index) => {
                        try {
                          console.log(`🔍 DEBUG: Lấy lịch cho giáo viên ${index + 1}/${teachersResponse.length}:`, teacher.name || teacher._id);
                          const scheduleResponse = await teacherService.getTeacherSchedule(teacher._id || teacher.id, {
                            startDate: newSchedule.date,
                            endDate: newSchedule.date
                          });
                          console.log(`🔍 DEBUG: Response cho ${teacher.name}:`, scheduleResponse);

                          if (scheduleResponse && scheduleResponse.schedules && scheduleResponse.schedules.length > 0) {
                            const schedulesOnDate = scheduleResponse.schedules.filter(s => {
                              const scheduleDate = s.date || s.scheduleDate || s.classDate;

                              // Chuẩn hóa format date để so sánh
                              let normalizedScheduleDate = scheduleDate;
                              if (scheduleDate && scheduleDate.includes('/')) {
                                // Convert DD/MM/YYYY to YYYY-MM-DD
                                const [day, month, year] = scheduleDate.split('/');
                                normalizedScheduleDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                              }

                              const matches = normalizedScheduleDate === newSchedule.date;
                              console.log(`🔍 DEBUG: Kiểm tra schedule date ${scheduleDate} -> ${normalizedScheduleDate} === ${newSchedule.date}:`, matches);
                              return matches;
                            });

                            console.log(`🔍 DEBUG: Số lịch trong ngày cho ${teacher.name}:`, schedulesOnDate.length);

                            if (schedulesOnDate.length > 0) {
                              return {
                                teacherName: teacher.name || teacher.fullName || 'N/A',
                                teacherId: teacher._id || teacher.id,
                                schedules: schedulesOnDate.map(s => ({
                                  className: s.className || s.class?.name || 'N/A',
                                  startTime: s.startTime,
                                  endTime: s.endTime,
                                  room: s.room?.room_name || s.room?.name || 'N/A'
                                }))
                              };
                            }
                          }
                        } catch (error) {
                          console.log(`🔍 DEBUG: Lỗi lấy lịch cho ${teacher.name}:`, error.message);
                          // Ignore individual teacher errors
                        }
                        return null;
                      });

                      console.log('🔍 DEBUG: Chờ Promise.all hoàn thành');
                      const teacherSchedules = await Promise.all(teacherSchedulesPromises);
                      const validSchedules = teacherSchedules.filter(s => s !== null);
                      console.log('🔍 DEBUG: Số giáo viên có lịch:', validSchedules.length);

                      if (validSchedules.length > 0) {
                        validSchedules.forEach(teacherSchedule => {
                          console.log(`  👨‍🏫 ${teacherSchedule.teacherName} (${teacherSchedule.teacherId}):`);
                          teacherSchedule.schedules.forEach(schedule => {
                            console.log(`    - ${schedule.className}: ${schedule.startTime}-${schedule.endTime} tại ${schedule.room}`);
                          });
                        });
                      } else {
                        console.log('  Không có lịch dạy nào vào ngày này');
                      }
                    } else {
                      console.log('  Không có danh sách giáo viên');
                    }
                  } catch (error) {
                    console.log('  Lỗi khi lấy lịch giáo viên:', error.message);
                    console.log('  Chi tiết lỗi:', error);
                  }
                })();

                // Calculate matching schedule IDs if updateScope is 'future'
                let matchingScheduleIds = [];
                if (updateScope === 'future') {
                  // Get current schedule info
                  let currentSchedule = null;
                  if (fullClassData?.schedules) {
                    currentSchedule = fullClassData.schedules.find(s => {
                      const sId = s._id || s.id;
                      return String(sId) === String(scheduleId);
                    });
                  }

                  if (currentSchedule) {
                    const currentDate = new Date(currentSchedule.date);
                    currentDate.setHours(0, 0, 0, 0);
                    const currentDayOfWeek = currentDate.getDay();
                    const currentStartTime = currentSchedule.startTime;
                    const currentEndTime = currentSchedule.endTime;

                    // Get all schedules of the class
                    const allSchedules = fullClassData?.schedules || [];
                    const matchingSchedules = allSchedules.filter(s => {
                      const sDate = new Date(s.date);
                      sDate.setHours(0, 0, 0, 0);
                      const sDayOfWeek = sDate.getDay();
                      return sDayOfWeek === currentDayOfWeek &&
                             s.startTime === currentStartTime &&
                             s.endTime === currentEndTime &&
                             sDate >= currentDate;
                    });

                    matchingScheduleIds = matchingSchedules.map(s => String(s._id || s.id));
                  }
                }

                // Save to pendingScheduleChanges
                setPendingScheduleChanges(prev => {
                  // Remove existing changes for this scheduleId or any matching scheduleIds
                  const scheduleIdsToRemove = updateScope === 'future' && matchingScheduleIds.length > 0
                    ? [scheduleId, ...matchingScheduleIds]
                    : [scheduleId];
                  
                  const filtered = prev.filter(change => {
                    // Remove if this change affects any of the schedules we're about to update
                    if (change.updateScope === 'future' && change.matchingScheduleIds) {
                      return !scheduleIdsToRemove.some(id => 
                        String(change.scheduleId) === String(id) || 
                        change.matchingScheduleIds.some(mid => String(mid) === String(id))
                      );
                    }
                    return !scheduleIdsToRemove.some(id => String(change.scheduleId) === String(id));
                  });
                  
                  // Add new change
                  return [...filtered, {
                    scheduleId,
                    oldSchedule,
                    newSchedule,
                    updateScope,
                    isRoomChangeOnly,
                    matchingScheduleIds: updateScope === 'future' ? matchingScheduleIds : undefined
                  }];
                });

                await Swal.fire({
                  icon: 'success',
                  title: 'Đã lưu tạm thời',
                  text: 'Thay đổi đã được lưu tạm thời. Vui lòng bấm "Lưu thay đổi" ở form chính để áp dụng.'
                });
                setShowConfirmUpdateModal(false);
                setShowScheduleDetailModal(false);
                setSelectedScheduleDetail(null);
                setEditedSchedule(null);
                setUpdateScope('single');
                setConfirmUpdateValidationResult(null);
              } catch (error) {
                console.error('Error preparing schedule change:', error);
                await Swal.fire({
                  icon: 'error',
                  title: 'Lỗi',
                  text: 'Có lỗi xảy ra. Vui lòng thử lại.'
                });
              } finally {
                setValidatingConfirmUpdate(false);
              }
            }}
          >
            {validatingConfirmUpdate ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang kiểm tra...
              </>
            ) : savingSchedule ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Xác nhận
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Schedule Modal */}
      <Modal 
        show={showAddScheduleModal} 
        onHide={() => {
          setShowAddScheduleModal(false);
          setValidationResult(null);
        }} 
        centered
        size="md"
      >
        <Modal.Header closeButton className="bg-main-600 text-white border-0 p-24">
          <Modal.Title className="fw-bold">
            <i className="fas fa-plus me-2"></i>
            Thêm buổi học
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-24">
          <Form>
            <Form.Group className="mb-16">
              <Form.Label className="text-neutral-700 fw-medium mb-8">
                Chọn thứ <span className="text-danger-600">*</span>
              </Form.Label>
              <Form.Select
                value={newScheduleData.day}
                onChange={(e) => setNewScheduleData({ ...newScheduleData, day: e.target.value })}
                className="border-neutral-30 radius-8 px-16 py-10"
                required
                disabled={fullClassData?.status !== 'disable'}
              >
                <option value="">-- Chọn thứ --</option>
                {daysOfWeek.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Giờ bắt đầu <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    value={newScheduleData.startTime}
                    onChange={(e) => setNewScheduleData({ ...newScheduleData, startTime: e.target.value })}
                    className="border-neutral-30 radius-8 px-16 py-10"
                    required
                    disabled={fullClassData?.status !== 'disable'}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Giờ kết thúc <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    value={newScheduleData.endTime}
                    onChange={(e) => setNewScheduleData({ ...newScheduleData, endTime: e.target.value })}
                    className="border-neutral-30 radius-8 px-16 py-10"
                    required
                    disabled={fullClassData?.status !== 'disable'}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-0">
              <Form.Check
                type="checkbox"
                id="repeatWeekly"
                label="Lặp lại vào các tuần"
                checked={newScheduleData.repeatWeekly}
                onChange={(e) => setNewScheduleData({ ...newScheduleData, repeatWeekly: e.target.checked })}
                className="text-neutral-700"
                disabled={fullClassData?.status !== 'disable'}
              />
            </Form.Group>
          </Form>

          {/* Validation Result */}
          {validatingSchedule && (
            <div className="mt-16">
              <div className="d-flex align-items-center text-neutral-600 text-14">
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang kiểm tra xung đột lịch học...
              </div>
            </div>
          )}

          {validationResult && !validatingSchedule && validationResult.conflicts?.hasConflict && (
            <div className="mt-16">
              <Alert variant="danger" className="mb-0">
                <div className="fw-semibold mb-8">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Có xung đột lịch học được phát hiện:
                </div>

                {validationResult.conflicts.teacher && validationResult.conflicts.teacher.length > 0 && (
                  <div className="mb-8">
                    <div className="fw-medium mb-4">🔴 Xung đột Giáo viên:</div>
                    <ul className="mb-0 ps-16">
                      {validationResult.conflicts.teacher.map((conflict, idx) => (
                        <li key={idx} className="text-13">
                          Lớp <strong>{conflict.className}</strong> vào {conflict.date} từ {conflict.time}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.conflicts.room && validationResult.conflicts.room.length > 0 && (
                  <div className="mb-8">
                    <div className="fw-medium mb-4">🔴 Xung đột Phòng học:</div>
                    <ul className="mb-0 ps-16">
                      {validationResult.conflicts.room.map((conflict, idx) => (
                        <li key={idx} className="text-13">
                          {conflict.isCurrentClass ? (
                            <>
                              <strong>Lớp này đã có buổi học</strong> vào {conflict.date} từ {conflict.time}.
                              Một lớp không thể có 2 buổi học cùng thứ cùng giờ.
                            </>
                          ) : (
                            <>
                              Lớp <strong>{conflict.className}</strong> vào {conflict.date} từ {conflict.time}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.conflicts.students && validationResult.conflicts.students.length > 0 && (
                  <div className="mb-8">
                    <div className="fw-medium mb-4">🔴 Xung đột Sinh viên:</div>
                    <ul className="mb-0 ps-16">
                      {validationResult.conflicts.students.map((studentConflict, idx) => (
                        <li key={idx} className="text-13 mb-4">
                          <strong>{studentConflict.studentName || `Sinh viên ${studentConflict.studentId}`}</strong>
                          <ul className="ps-16 mt-2 mb-0">
                            {studentConflict.conflicts.map((conflict, cIdx) => (
                              <li key={cIdx} className="text-12">
                                Lớp <strong>{conflict.className}</strong> vào {conflict.date} từ {conflict.time}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-neutral-25 border-0 p-20">
          <Button
            variant="secondary"
            className="btn-outline-neutral-600 text-14 fw-medium px-20 py-10"
            onClick={() => {
              setShowAddScheduleModal(false);
              setValidationResult(null);
            }}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            className="btn-main text-14 fw-medium px-20 py-10"
            disabled={savingSchedule || validatingSchedule || (validationResult?.conflicts?.hasConflict === true) || fullClassData?.status !== 'disable'}
            onClick={async () => {
              if (!newScheduleData.day || !newScheduleData.startTime || !newScheduleData.endTime) {
                return;
              }

              try {
                setSavingSchedule(true);
                
                // Lấy classId từ formData
                const classId = formData.id || formData._id;
                if (!classId) {
                  await Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không tìm thấy ID lớp học'
                  });
                  return;
                }

                // Lấy room từ formData (hoặc từ fullClassData)
                const roomId = formData.roomId || fullClassData?.room?._id || fullClassData?.room?.id;
                if (!roomId) {
                  await Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin',
                    text: 'Lớp học chưa có phòng học được gán'
                  });
                  return;
                }

                // Chuyển đổi day từ format 'CN', '2', '3'... sang date cụ thể
                const today = new Date();
                const dayMap = { 'CN': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6 };
                const targetDay = dayMap[newScheduleData.day];
                
                console.log('[DEBUG] Tính toán ngày:');
                console.log('   - Thứ được chọn:', newScheduleData.day);
                console.log('   - targetDay (0=CN, 1=T2, ..., 6=T7):', targetDay);
                console.log('   - Hôm nay là thứ:', today.getDay(), `(${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][today.getDay()]})`);
                
                // Tìm ngày tiếp theo có thứ tương ứng
                let daysToAdd = (targetDay - today.getDay() + 7) % 7;
                if (daysToAdd === 0) daysToAdd = 7; // Nếu hôm nay là thứ đó, lấy tuần sau
                
                console.log('   - Số ngày cần cộng:', daysToAdd);
                
                const scheduleDate = new Date(today);
                scheduleDate.setDate(today.getDate() + daysToAdd);
                scheduleDate.setHours(0, 0, 0, 0);
                
                const calculatedDay = scheduleDate.getDay();
                const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                console.log('   - Ngày được tính:', scheduleDate.toLocaleDateString('vi-VN'), `(${dayNames[calculatedDay]})`);
                console.log('   - Kiểm tra: Ngày tính có đúng thứ được chọn không?', calculatedDay === targetDay ? ' ĐÚNG' : ' SAI');
                
                // Format date để tránh timezone issues (dùng local time, không dùng UTC)
                const year = scheduleDate.getFullYear();
                const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
                const day = String(scheduleDate.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}`;
                
                console.log('   - Date string sẽ gửi (tránh timezone):', dateString);
                console.log('');

                const scheduleData = {
                  classId: classId,
                  date: dateString, // Dùng dateString thay vì toISOString() để tránh timezone issues
                  startTime: newScheduleData.startTime,
                  endTime: newScheduleData.endTime,
                  room: roomId,
                  repeatWeekly: newScheduleData.repeatWeekly || false,
                  selectedDay: newScheduleData.day // Thêm thông tin thứ được chọn để debug
                };

                // ========== LOGGING: Trước khi tạo ==========
                console.log(' ========== TẠO BUỔI HỌC ==========');
                console.log(' Thông tin buổi học sẽ được thêm:');
                console.log('   - Lớp học ID:', classId);
                console.log('   - Lặp lại vào các tuần:', newScheduleData.repeatWeekly ? 'Có' : 'Không');
                console.log('   - Ngày đầu tiên:', scheduleData.date);
                console.log('   - Thứ:', newScheduleData.day);
                console.log('   - Giờ bắt đầu:', scheduleData.startTime);
                console.log('   - Giờ kết thúc:', scheduleData.endTime);
                console.log('   - Phòng học ID:', roomId);
                console.log('   - Phòng học:', fullClassData?.room?.room_name || 'N/A');
                console.log('');
                console.log('⏳ Đang gọi API tạo buổi học...');
                console.log('==========================================');

                // Gọi API tạo buổi học
                const response = await classScheduleService.createClassSchedule(scheduleData);

                // ========== LOGGING: Kết quả từ API ==========
                console.log(' ========== KẾT QUẢ TẠO BUỔI HỌC ==========');
                console.log(' Response:', response);
                console.log('');
                
                if (response.cleanupInfo) {
                  console.log('🧹 Thông tin cleanup:');
                  console.log('   - Số buổi đã xóa:', response.cleanupInfo.deletedCount || 0);
                  console.log('   - Số buổi đã gán lại session:', response.cleanupInfo.reassignedSessions || 0);
                  console.log('   - Tổng số buổi sau cleanup:', response.cleanupInfo.totalSchedules || 0);
                }
                console.log('==========================================');
                
                // Hiển thị thông báo thành công
                const message = response.message || 'Đã tạo buổi học thành công!';
                if (response.cleanupInfo && response.cleanupInfo.deletedCount > 0) {
                  await Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    html: `${message}<br/><br/>Đã xóa ${response.cleanupInfo.deletedCount} buổi học thừa để đảm bảo số buổi đúng với numberOfSessions.`
                  });
                } else {
                  await Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: message
                  });
                }
                
                // Đóng modal
                setShowAddScheduleModal(false);
                
                // Reset form
                setNewScheduleData({
                  day: '',
                  startTime: '',
                  endTime: '',
                  repeatWeekly: false
                });
                
                // Refresh lại class data để hiển thị các buổi học mới
                if (classId) {
                  try {
                    const classResponse = await classService.getClassById(classId);
                    let updatedClassData = null;
                    if (classResponse && classResponse.success && classResponse.class) {
                      updatedClassData = classResponse.class;
                    } else if (classResponse && classResponse.data) {
                      updatedClassData = classResponse.data;
                    } else if (classResponse && classResponse.class) {
                      updatedClassData = classResponse.class;
                    }
                    
                    if (updatedClassData) {
                      setFullClassData(updatedClassData);
                      console.log(' Đã refresh lại class data với schedules mới');
                    }
                  } catch (refreshError) {
                    console.error('Error refreshing class data:', refreshError);
                    // Không hiển thị lỗi cho user vì đã tạo schedule thành công
                  }
                }
              } catch (error) {
                console.error('Error creating schedule:', error);
                const errorMessage = error.message || error.response?.data?.message || 'Có lỗi xảy ra khi thêm buổi học';
                await Swal.fire({
                  icon: 'error',
                  title: 'Lỗi',
                  text: errorMessage
                });
              } finally {
                setSavingSchedule(false);
              }
            }}
          >
            {savingSchedule ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Thêm
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Information Modal for Deleted Schedules */}
      <Modal
        show={showConfirmDeleteModal}
        onHide={() => {
          setShowConfirmDeleteModal(false);
          setSchedulesToDelete([]);
          setPendingScheduleData(null);
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-info text-white border-0 p-24">
          <Modal.Title className="fw-bold">
            <i className="fas fa-info-circle me-2"></i>
            Thông báo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-24">
          <Alert variant="info" className="mb-16">
            <i className="fas fa-check-circle me-2"></i>
            Buổi học đã được thêm thành công! Các buổi học sau đã được xóa tự động để đảm bảo tổng số buổi không vượt quá số buổi quy định của khóa học:
          </Alert>
          
          {schedulesToDelete.length > 0 && (
            <div className="mb-16">
              <h6 className="text-neutral-700 fw-semibold mb-12">Danh sách buổi học sẽ bị xóa:</h6>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="text-13 fw-semibold">Ngày</th>
                      <th className="text-13 fw-semibold">Giờ bắt đầu</th>
                      <th className="text-13 fw-semibold">Giờ kết thúc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedulesToDelete.map((schedule, index) => {
                      const date = new Date(schedule.date);
                      const formattedDate = date.toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                      
                      return (
                        <tr key={schedule._id || index}>
                          <td className="text-13">{formattedDate}</td>
                          <td className="text-13">{schedule.startTime}</td>
                          <td className="text-13">{schedule.endTime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
        </Modal.Body>
        <Modal.Footer className="bg-neutral-25 border-0 p-20">
          <Button
            variant="primary"
            className="btn-main text-14 fw-medium px-20 py-10"
            onClick={async () => {
              // Refresh data và đóng modal
              const classId = formData.id || formData._id;
              
              if (classId) {
                try {
                  const classResponse = await classService.getClassById(classId);
                  if (classResponse && classResponse.data) {
                    setFullClassData(classResponse.data);
                  }
                } catch (error) {
                  console.error('Error refreshing class data:', error);
                }
              }
              
              setShowConfirmDeleteModal(false);
              setSchedulesToDelete([]);
              setPendingScheduleData(null);
              setNewScheduleData({
                day: '',
                startTime: '08:00',
                endTime: '10:00',
                repeatWeekly: false
              });
            }}
          >
            <i className="fas fa-check me-2"></i>
            Đã hiểu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditClassForm;


