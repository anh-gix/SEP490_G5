import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from 'xlsx';
import classService from '../../services/classService';
import teacherService from '../../services/teacherService';
import roomService from '../../services/roomService';
import scheduleService from '../../services/scheduleService';
import studentService from '../../services/studentService';
import SelectStudentModal from './SelectStudentModal';

const createEmptyScheduleEntry = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  day: '',
  startTime: '08:00',
  endTime: '10:00'
});

const EditClassModal = ({ classData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: '',
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
    tuitionFee: 0,
    status: 'pending'
  });

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [studentsFetched, setStudentsFetched] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [dateError, setDateError] = useState('');
  const [teacherSchedules, setTeacherSchedules] = useState({}); // Map teacherId -> schedules
  const [studentSchedules, setStudentSchedules] = useState({}); // Map studentId -> schedules
  const [studentSchedulesLoading, setStudentSchedulesLoading] = useState(false); // Loading state for student schedules
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [scheduleEntriesError, setScheduleEntriesError] = useState(null);
  const [duplicateEntryIndices, setDuplicateEntryIndices] = useState([]);
  const [fullClassData, setFullClassData] = useState(null); // Store full class data with schedules
  const [loadingClassData, setLoadingClassData] = useState(false); // Loading state for class data
  const [availablePrograms, setAvailablePrograms] = useState([]); // Programs for dropdown
  const [availableLevels, setAvailableLevels] = useState([]); // Levels for dropdown
  const [courses, setCourses] = useState([]); // Courses for dropdown
  const [coursesLoading, setCoursesLoading] = useState(false); // Loading state for courses
  
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
        
        if (response && response.success && response.class) {
          setFullClassData(response.class);
        } else {
          setFullClassData(classData); // Fallback to classData prop
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching full class data:', error);
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
        const startDateObj = new Date(dataToUse.startDate);
        if (!isNaN(startDateObj.getTime())) {
          formattedStartDate = startDateObj.toISOString().split('T')[0];
        }
      }
      
      if (dataToUse.endDate) {
        const endDateObj = new Date(dataToUse.endDate);
        if (!isNaN(endDateObj.getTime())) {
          formattedEndDate = endDateObj.toISOString().split('T')[0];
        }
      }


      // Extract teacherId - handle both object and ID formats
      const teacherId = 
        dataToUse.teacherId ||
        (dataToUse.teacher?._id ? String(dataToUse.teacher._id) : '') ||
        (dataToUse.teacher?.id ? String(dataToUse.teacher.id) : '') ||
        (typeof dataToUse.teacher === 'string' ? String(dataToUse.teacher) : '') ||
        '';

      // Extract roomId - handle both object and ID formats
      const roomId = 
        dataToUse.roomId ||
        (dataToUse.room?._id ? String(dataToUse.room._id) : '') ||
        (dataToUse.room?.id ? String(dataToUse.room.id) : '') ||
        (typeof dataToUse.room === 'string' ? String(dataToUse.room) : '') ||
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
            'Tiếng Anh Giao tiếp': 'cam'
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
            'Tiếng Anh Giao tiếp': 'cam'
          };
          return typeMap[dataToUse.program] || '';
        })() : '') ||
        '';

      // Debug: Log program type information for the selected class
      console.log('🔍 [EditClassModal] Class Program Type Debug:', {
        'Class ID': dataToUse.id || dataToUse._id,
        'Class Name': dataToUse.name,
        'Program Type (final extracted)': programType,
        'Source 1 - course.program.type': dataToUse.course?.program?.type,
        'Source 2 - programName (converted to type)': dataToUse.programName,
        'Source 3 - program (direct field)': dataToUse.program,
        'Course Name': dataToUse.course?.name,
        'Full course object': dataToUse.course,
        'Full program object': dataToUse.course?.program
      });

      // Ensure id is set correctly (use id or _id)
      const classId = dataToUse.id || dataToUse._id || '';

      // Reset refs when loading new class data
      prevProgramRef.current = null;
      prevLevelRef.current = null;

      setFormData({
        ...dataToUse,
        id: classId, // Explicitly set id to ensure it's available
        course: courseIdStr,
        program: programType || '', // Store TYPE (ielts, toeic, cam), not program name
        band: dataToUse.band || dataToUse.course?.program?.band || '', // Get band from dataToUse or course.program.band
        startDate: formattedStartDate || dataToUse.startDate || '',
        endDate: formattedEndDate || dataToUse.endDate || '',
        scheduleEntries,
        teacherId: teacherId, // Explicitly set teacherId
        roomId: roomId // Explicitly set roomId
      });

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
        console.error('❌ [EditClassModal] Error fetching students from API:', error);
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
        console.error('❌ [EditClassModal] Lỗi khi fetch teachers:', error);
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
        console.log('🔍 [EditClassModal] Fetching students for Excel import...');
        const response = await studentService.getAllStudents();
        console.log('📋 [EditClassModal] Students API Response:', response);
        
        if (response && (response.students || response.data)) {
          const fetchedStudents = response.students || response.data || [];
          console.log('📋 [EditClassModal] Fetched students count:', fetchedStudents.length);
          setStudents(fetchedStudents);
        } else {
          console.warn('⚠️ [EditClassModal] API response không có students hoặc data field:', response);
          setStudents([]);
          setStudentsError('Không tìm thấy dữ liệu học viên');
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Lỗi khi fetch students:', error);
        setStudents([]);
        const errorMessage = error.message || 'Không thể tải danh sách học viên';
        setStudentsError(errorMessage);
        console.error('❌ [EditClassModal] Error details:', error);
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
          setRooms(fetchedRooms);
        } else {
          setRooms([]);
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Lỗi khi fetch rooms:', error);
        setRooms([]);
      }
    };

    fetchRooms();
  }, []);

  // Fetch existing schedules for conflict checking
  useEffect(() => {
    const fetchExistingSchedules = async () => {
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
        console.error('❌ [EditClassModal] Error fetching existing schedules:', error);
        setExistingSchedules([]);
      } finally {
        setRoomLoading(false);
      }
    };

    fetchExistingSchedules();
  }, []);

  // Helper functions for conflict checking (same as CreateClassModal)
  // These must be defined before useMemo hooks that use them
  const parseTime = (time) => {
    if (!time) return null;
    return time.length === 5 ? time : time.slice(0, 5);
  };

  const hasTimeOverlap = (startA, endA, startB, endB) => {
    if (!startA || !endA || !startB || !endB) return false;
    return startA < endB && startB < endA;
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
          const date = new Date(scheduleDate);
          if (isNaN(date.getTime())) return null;
          return {
            date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
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

  // Check for room conflicts
  const conflictingRoomIds = useMemo(() => {
    if (!generatedSessions.length || !existingSchedules.length) {
      return new Set();
    }

    const conflicts = new Set();
    const currentClassId = formData.id || formData._id;

    // Check each generated session against existing schedules
    generatedSessions.forEach((session) => {
      const sessionDate = session.date;
      const sessionStart = parseTime(session.startTime);
      const sessionEnd = parseTime(session.endTime);

      existingSchedules.forEach((schedule) => {
        // Skip schedules from the current class being edited
        const scheduleClassId = schedule.class?._id?.toString() || 
                               schedule.classId?.toString() || 
                               schedule.class?.id?.toString();
        if (scheduleClassId && currentClassId && String(scheduleClassId) === String(currentClassId)) {
          return; // Skip current class schedules
        }

        // API populate room với _id và room_name
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
  }, [generatedSessions, existingSchedules, formData.id, formData._id]);

  // Fetch teacher schedules - need to get all schedules for conflict checking
  useEffect(() => {
    const fetchTeacherSchedules = async () => {
      if (!teachers.length || !generatedSessions.length) {
        return;
      }

      const schedulesMap = {};
      const currentClassId = formData.id || formData._id;
      
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
              // Filter out schedules from current class
              const filteredSchedules = response.schedules.filter(schedule => {
                const scheduleClassId = schedule.class?._id?.toString() || 
                                       schedule.classId?.toString() || 
                                       schedule.class?.id?.toString();
                return !(scheduleClassId && currentClassId && String(scheduleClassId) === String(currentClassId));
              });
              schedulesMap[String(teacherId)] = filteredSchedules;
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
  }, [teachers, generatedSessions, formData.id, formData._id]);

  // Check for teacher conflicts
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
            conflicts.add(teacherId);
          }
        });
      });
    });

    return conflicts;
  }, [generatedSessions, teacherSchedules]);

  // Fetch student schedules - need to get all schedules for conflict checking
  useEffect(() => {
    const fetchStudentSchedules = async () => {
      try {
        if (!selectedStudents.length) {
          setStudentSchedules({});
          setStudentSchedulesLoading(false);
          return;
        }

        setStudentSchedulesLoading(true);

        // Get current class ID - try both id and _id, convert to string for consistent comparison
        const currentClassIdRaw = formData.id || formData._id || classData?.id || classData?._id;
        const currentClassId = currentClassIdRaw ? String(currentClassIdRaw) : null;

        // Determine date range for fetching student schedules
        // Priority: fullClassData.schedules (immediate) > generatedSessions > formData dates > estimated
        let minDate = null;
        let maxDate = null;
        
        // Use fullClassData if available (has schedules), otherwise fallback to classData
        const dataSource = fullClassData || classData;
        
        // PRIORITY 1: Use dates from existing class schedules (most reliable, available immediately)
        if (dataSource?.schedules && Array.isArray(dataSource.schedules) && dataSource.schedules.length > 0) {
          const scheduleDates = dataSource.schedules
            .map(schedule => {
              const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
              if (!scheduleDate) return null;
              const date = new Date(scheduleDate);
              return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
            })
            .filter(Boolean)
            .sort();
          
          if (scheduleDates.length > 0) {
            minDate = scheduleDates[0];
            maxDate = scheduleDates[scheduleDates.length - 1];
          }
        } else if (generatedSessions.length > 0) {
          // PRIORITY 2: Use dates from generated sessions
          const sessionDates = generatedSessions.map(s => s.date).sort();
          minDate = sessionDates[0];
          maxDate = sessionDates[sessionDates.length - 1];
        } else if (formData.startDate && formData.endDate) {
          // Use class date range if available
          minDate = formData.startDate;
          maxDate = formData.endDate;
        } else if (formData.startDate) {
          // Estimate end date based on available information
          const start = new Date(formData.startDate);
          let estimatedWeeks = 12; // Default: 12 weeks (about 3 months)
          
          if (selectedCourse?.numberOfSessions && filledScheduleEntries.length > 0) {
            estimatedWeeks = Math.ceil(selectedCourse.numberOfSessions / filledScheduleEntries.length);
          } else if (filledScheduleEntries.length > 0) {
            // Estimate based on typical course duration
            estimatedWeeks = 12;
          }
          
          const end = new Date(start);
          end.setDate(start.getDate() + (estimatedWeeks * 7));
          minDate = formData.startDate;
          maxDate = end.toISOString().split('T')[0];
        }
        
        // If we still don't have dates, fetch without date filter (will get all schedules)
        // This ensures we can still show conflicts even if date range is unclear

        const schedulesMap = {};
        
        // Fetch schedules for each selected student
        await Promise.all(
          selectedStudents.map(async (studentId) => {
            if (!studentId) return;

            try {
              const params = {};
              if (minDate && maxDate) {
                params.startDate = minDate;
                params.endDate = maxDate;
              }
              
              const response = await studentService.getStudentSchedule(studentId, params);
              
              if (response && response.schedules) {
                // Filter out schedules from the current class being edited
                const filteredSchedules = response.schedules.filter(schedule => {
                  // Try multiple ways to get classId from schedule
                  const scheduleClassId = 
                    (schedule.class?._id && schedule.class._id.toString()) || 
                    (schedule.class?._id?._id && schedule.class._id._id.toString()) ||
                    (schedule.class?._id?.toString && schedule.class._id.toString()) ||
                    (schedule.classId && schedule.classId.toString()) || 
                    (schedule.class?.id && schedule.class.id.toString()) ||
                    (schedule.classSchedule?.class?._id && schedule.classSchedule.class._id.toString()) ||
                    (schedule.classSchedule?.class?._id?._id && schedule.classSchedule.class._id._id.toString());
                  
                  // Skip schedules from current class
                  if (scheduleClassId && currentClassId && String(scheduleClassId) === String(currentClassId)) {
                    return false;
                  }
                  return true;
                });
                
                schedulesMap[String(studentId)] = filteredSchedules;
              } else if (response && response.data) {
                const filteredSchedules = response.data.filter(schedule => {
                  const scheduleClassId = 
                    (schedule.class?._id && schedule.class._id.toString()) || 
                    (schedule.class?._id?._id && schedule.class._id._id.toString()) ||
                    (schedule.class?._id?.toString && schedule.class._id.toString()) ||
                    (schedule.classId && schedule.classId.toString()) || 
                    (schedule.class?.id && schedule.class.id.toString()) ||
                    (schedule.classSchedule?.class?._id && schedule.classSchedule.class._id.toString()) ||
                    (schedule.classSchedule?.class?._id?._id && schedule.classSchedule.class._id._id.toString());
                  
                  if (scheduleClassId && currentClassId && String(scheduleClassId) === String(currentClassId)) {
                    return false;
                  }
                  return true;
                });
                
                schedulesMap[String(studentId)] = filteredSchedules;
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
        setStudentSchedulesLoading(false);
      } catch (error) {
        console.error('Error in fetchStudentSchedules:', error);
        setStudentSchedules({});
        setStudentSchedulesLoading(false);
      }
    };

    fetchStudentSchedules();
  }, [
    selectedStudents, 
    generatedSessions, 
    formData.id, 
    formData._id, 
    formData.startDate, 
    formData.endDate, 
    filledScheduleEntries, 
    selectedCourse, 
    classData,
    fullClassData,
    fullClassData?.schedules,
    classData?.schedules
  ]);

  // Check for student conflicts
  const conflictingStudentIds = useMemo(() => {
    // Get sessions to check - priority: generatedSessions (from edited scheduleEntries) > schedules from database
    let sessionsToCheck = [];
    
    // PRIORITY 1: Use generatedSessions if available (user may have edited scheduleEntries)
    // This ensures we check conflicts against the NEW schedule, not the old one
    if (generatedSessions.length > 0) {
      sessionsToCheck = generatedSessions.map(session => ({
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime
      }));
    } else {
      // PRIORITY 2: Fallback to schedules from database if generatedSessions not available yet
      // Use fullClassData if available (has schedules), otherwise fallback to classData
      const dataSource = fullClassData || classData;
      
      if (dataSource?.schedules && Array.isArray(dataSource.schedules) && dataSource.schedules.length > 0) {
        sessionsToCheck = dataSource.schedules
          .filter(schedule => {
            const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
            return scheduleDate && schedule.startTime && schedule.endTime;
          })
          .map(schedule => {
            const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
            const date = new Date(scheduleDate);
            if (isNaN(date.getTime())) return null;
            return {
              date: date.toISOString().split('T')[0],
              startTime: schedule.startTime || schedule.start_time || '08:00',
              endTime: schedule.endTime || schedule.end_time || '10:00'
            };
          })
          .filter(Boolean); // Remove null entries
        
      }
    }
    
    if (!sessionsToCheck.length || Object.keys(studentSchedules).length === 0) {
      return new Map();
    }

    const conflicts = new Map(); // Map<studentId, Array<conflictDetails>>
    // Get current class ID - try both id and _id, convert to string for consistent comparison
    const currentClassIdRaw = formData.id || formData._id || classData?.id || classData?._id;
    const currentClassId = currentClassIdRaw ? String(currentClassIdRaw) : null;

    // Check each student's schedules
    Object.entries(studentSchedules).forEach(([studentId, schedules]) => {
      if (!schedules || schedules.length === 0) return;

      const studentConflicts = [];

      // Check each session against student's schedules
      sessionsToCheck.forEach((session) => {
        const sessionDate = session.date;
        const sessionStart = parseTime(session.startTime);
        const sessionEnd = parseTime(session.endTime);

        schedules.forEach((schedule) => {
          // Skip schedules from the current class being edited
          // Try multiple ways to get classId from schedule
          const scheduleClassId = 
            (schedule.class?._id && schedule.class._id.toString()) || 
            (schedule.class?._id?._id && schedule.class._id._id.toString()) ||
            (schedule.class?._id?.toString && schedule.class._id.toString()) ||
            (schedule.classId && schedule.classId.toString()) || 
            (schedule.class?.id && schedule.class.id.toString()) ||
            (schedule.classSchedule?.class?._id && schedule.classSchedule.class._id.toString()) ||
            (schedule.classSchedule?.class?._id?._id && schedule.classSchedule.class._id._id.toString());
          
          if (scheduleClassId && currentClassId && String(scheduleClassId) === String(currentClassId)) {
            return; // Skip current class schedules
          }

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
          }
        });
      });

      if (studentConflicts.length > 0) {
        conflicts.set(studentId, studentConflicts);
      }
    });

    return conflicts;
  }, [generatedSessions, studentSchedules, formData.id, formData._id, classData, fullClassData, fullClassData?.schedules, classData?.schedules]);

  // Filter rooms based on conflicts
  const filteredRooms = useMemo(() => {
    if (!generatedSessions.length || !existingSchedules.length) {
      return rooms;
    }

    const filtered = rooms.filter(
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

  // Filter teachers based on conflicts
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
    'Tiếng Anh Giao tiếp': 'cam'
  };

  // Reverse mapping: type to program name
  const typeToProgramMap = {
    'ielts': 'IELTS',
    'toeic': 'TOEIC',
    'cam': 'Tiếng Anh Giao tiếp'
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
      'cancelled': 'Đã hủy'
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
        setSelectedStudents(prev => {
          const newSelected = [...new Set([...prev, ...matchedStudentIds])];
          return newSelected;
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
          console.log('🔄 [EditClassModal] Clearing course due to program/level change:', {
            oldCourse: formData.course,
            oldProgram: courseProgramType,
            oldLevel: courseLevel,
            newProgram,
            newLevel
          });
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
        console.log('🔄 [EditClassModal] Clearing course ID due to program/level change');
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

  // Auto-fetch band when program and level are selected (when status is pending)
  useEffect(() => {
    const fetchBand = async () => {
      // Only fetch band if status is pending (editable mode)
      if (formData.status !== 'pending') {
        return;
      }

      if (!formData.program || !formData.level) {
        // Clear band if program (type) or level is missing
        setFormData(prev => ({ ...prev, band: '' }));
        return;
      }

      // formData.program is now TYPE (ielts, toeic, cam), use it directly
      const type = formData.program;
      if (!type || !['ielts', 'toeic', 'cam'].includes(type)) {
        setFormData(prev => ({ ...prev, band: '' }));
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/api/v1/courses/band', {
          params: {
            type: type,
            level: formData.level
          }
        });

        if (response.data && response.data.success && response.data.band) {
          setFormData(prev => ({ ...prev, band: response.data.band }));
        } else {
          setFormData(prev => ({ ...prev, band: '' }));
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching band:', error);
        setFormData(prev => ({ ...prev, band: '' }));
      }
    };

    fetchBand();
  }, [formData.program, formData.level, formData.status]);

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
  }, [formData.roomId, selectedStudents, rooms]);

  // Fetch programs and levels when status is pending (editable mode)
  useEffect(() => {
    const fetchProgramsAndLevels = async () => {
      // Don't fetch if formData is not initialized yet
      if (!formData || !formData.status) {
        return;
      }

      if (formData.status !== 'pending') {
        setAvailablePrograms([]);
        setAvailableLevels([]);
        return;
      }

      try {
        const [typesResponse, levelsResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/courses/all-types'),
          axios.get('http://localhost:8080/api/v1/courses/all-levels')
        ]);
        
        let allPrograms = [];
        if (typesResponse.data?.success && typesResponse.data.types) {
          const allTypes = typesResponse.data.types;
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
        if (levelsResponse.data?.success && levelsResponse.data.levels) {
          allLevels = levelsResponse.data.levels;
        }
        
        // Ensure current level is in the list
        if (formData.level && !allLevels.includes(formData.level)) {
          allLevels.push(formData.level);
        }
        setAvailableLevels(allLevels);
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching programs and levels:', error);
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


  // Filter levels based on selected program (when status is pending)
  useEffect(() => {
    const filterLevels = async () => {
      if (formData.status !== 'pending') {
        return;
      }

      if (!formData.program) {
        try {
          const response = await axios.get('http://localhost:8080/api/v1/courses/all-levels');
          if (response.data?.success && response.data.levels) {
            let levels = response.data.levels;
            // Ensure current level is in the list
            if (formData.level && !levels.includes(formData.level)) {
              levels.push(formData.level);
            }
            setAvailableLevels(levels);
          }
        } catch (error) {
          console.error('❌ [EditClassModal] Error fetching all levels:', error);
          // Keep current level in list even on error
          if (formData.level) {
            setAvailableLevels([formData.level]);
          }
        }
        return;
      }

      // formData.program is now TYPE (ielts, toeic, cam), use it directly
      const type = formData.program;
      if (!type || !['ielts', 'toeic', 'cam'].includes(type)) {
        // If type is invalid, keep current level in list
        if (formData.level) {
          setAvailableLevels([formData.level]);
        } else {
          setAvailableLevels([]);
        }
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/api/v1/courses/levels', {
          params: { type }
        });
        if (response.data?.success && response.data.levels) {
          let levels = response.data.levels;
          // Ensure current level is in the list even if not in filtered results
          if (formData.level && !levels.includes(formData.level)) {
            levels.push(formData.level);
          }
          setAvailableLevels(levels);
        } else {
          // Keep current level in list if no response
          if (formData.level) {
            setAvailableLevels([formData.level]);
          }
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching levels by type:', error);
        // Keep current level in list even on error
        if (formData.level) {
          setAvailableLevels([formData.level]);
        }
      }
    };
    
    if (formData.status === 'pending') {
      filterLevels();
    }
  }, [formData.program, formData.status, formData.level]);

  // Fetch courses when program and level are selected (when status is pending)
  useEffect(() => {
    const fetchCourses = async () => {
      if (formData.status !== 'pending') {
        setCourses([]);
        return;
      }

      if (!formData.program || !formData.level) {
        // If we have a current course, keep it in the list
        if (formData.course && selectedCourse) {
          setCourses([selectedCourse]);
        } else {
          setCourses([]);
        }
        return;
      }

      // formData.program is TYPE (ielts, toeic, cam), convert to programName for API
      const type = formData.program;
      const programName = typeToProgramMap[type];
      
      console.log('🔍 [EditClassModal] Fetching courses:', {
        type,
        programName,
        level: formData.level,
        hasProgramName: !!programName
      });
      
      if (!programName) {
        console.warn('⚠️ [EditClassModal] No programName mapped for type:', type);
        setCourses([]);
        setCoursesLoading(false);
        return;
      }

      try {
        setCoursesLoading(true);
        const response = await axios.get('http://localhost:8080/api/v1/courses/by-program', {
          params: {
            programName: programName,
            level: formData.level
          }
        });

        console.log('✅ [EditClassModal] Courses API response:', {
          success: response.data?.success,
          coursesCount: response.data?.courses?.length,
          courses: response.data?.courses
        });

        if (response.data && response.data.success && response.data.courses) {
          let coursesList = response.data.courses;
          
          // Check if program/level actually changed (not just initial load)
          const programChanged = prevProgramRef.current !== null && prevProgramRef.current !== formData.program;
          const levelChanged = prevLevelRef.current !== null && prevLevelRef.current !== formData.level;
          const isInitialLoad = prevProgramRef.current === null && prevLevelRef.current === null;
          
          // Update refs for next comparison
          prevProgramRef.current = formData.program;
          prevLevelRef.current = formData.level;
          
          // Check if current course exists in the new list
          if (formData.course) {
            console.log('🔍 [EditClassModal] Checking if current course exists in list:', {
              currentCourseId: formData.course,
              coursesListIds: coursesList.map(c => String(c._id || c.id)),
              selectedCourseId: selectedCourse ? String(selectedCourse._id || selectedCourse.id) : null,
              programChanged,
              levelChanged,
              isInitialLoad
            });
            
            const courseExists = coursesList.some(c => {
              const courseId = c._id || c.id;
              const matches = String(courseId) === String(formData.course);
              if (matches) {
                console.log('✅ [EditClassModal] Current course found in list:', courseId);
              }
              return matches;
            });
            
            console.log('📊 [EditClassModal] Course exists check result:', courseExists);
            
            // Only clear course if:
            // 1. Program or level actually changed (not initial load)
            // 2. AND course doesn't exist in the new list
            if ((programChanged || levelChanged) && !courseExists) {
              console.log('🔄 [EditClassModal] Program/level changed and course does not belong to new program/level, clearing it');
              setFormData(prev => ({ ...prev, course: '' }));
              setSelectedCourse(null);
            } else if (!isInitialLoad && (programChanged || levelChanged) && selectedCourse) {
              // Verify selectedCourse matches the new program/level only if program/level changed
              const courseProgramType = selectedCourse.program?.type;
              const courseLevel = selectedCourse.program?.level;
              
              if (courseProgramType !== formData.program || courseLevel !== formData.level) {
                console.log('🔄 [EditClassModal] Selected course does not match new program/level, clearing it');
                setFormData(prev => ({ ...prev, course: '' }));
                setSelectedCourse(null);
              }
            } else if (!courseExists && !isInitialLoad) {
              // If course doesn't exist and it's not initial load, try to add it to list
              if (selectedCourse) {
                console.log('➕ [EditClassModal] Adding selectedCourse to list (course not in new list but keeping it)');
                coursesList.push(selectedCourse);
              }
            }
          }
          
          console.log('📋 [EditClassModal] Final courses list:', coursesList);
          setCourses(coursesList);
        } else {
          console.warn('⚠️ [EditClassModal] No courses in response:', response.data);
          // If no courses found but we have a current course, keep it in the list
          if (formData.course && selectedCourse) {
            setCourses([selectedCourse]);
          } else {
            setCourses([]);
          }
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching courses:', error);
        console.error('❌ [EditClassModal] Error details:', error.response?.data);
        console.error('❌ [EditClassModal] Request params:', {
          programName,
          level: formData.level,
          url: 'http://localhost:8080/api/v1/courses/by-program'
        });
        // On error, keep current course in list if available
        if (formData.course && selectedCourse) {
          setCourses([selectedCourse]);
        } else {
          setCourses([]);
        }
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [formData.program, formData.level, formData.status, formData.course]);

  // No need to fetch courses list - we only display the course of this class

  // Update selectedCourse when course changes (either from dropdown or initial load)
  useEffect(() => {
    const updateSelectedCourse = async () => {
      if (!formData.course) {
        setSelectedCourse(null);
        return;
      }

      // First, try to find course in the courses list (if in pending mode and courses are loaded)
      if (formData.status === 'pending' && courses.length > 0) {
        const foundCourse = courses.find(c => (c._id || c.id) === formData.course);
        if (foundCourse) {
          setSelectedCourse(foundCourse);
          return;
        }
      }

      // Otherwise, fetch course details from API
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/courses/${formData.course}/details`);
        
        if (response.data && response.data.success && response.data.data) {
          setSelectedCourse(response.data.data);
        } else {
          setSelectedCourse(null);
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching course details:', error);
        setSelectedCourse(null);
      }
    };

    updateSelectedCourse();
  }, [formData.course, formData.status, courses]);


  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.level || !formData.program) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    // Validate course is selected
    if (!formData.course) {
      alert('Vui lòng chọn course!');
      return;
    }

    if (
      formData.scheduleEntries.length === 0 ||
      formData.scheduleEntries.some(entry => !entry.day)
    ) {
      alert('Vui lòng chọn ít nhất 1 ngày học và điền đủ thời gian!');
      return;
    }

    if (
      formData.scheduleEntries.some(
        entry => entry.startTime >= entry.endTime
      )
    ) {
      alert('Giờ bắt đầu phải nhỏ hơn giờ kết thúc!');
      return;
    }

    // Check for duplicate schedule entries
    const duplicateIndices = checkDuplicateEntries(formData.scheduleEntries);
    if (duplicateIndices.length > 0) {
      setScheduleEntriesError('Có các buổi học trùng lặp. Vui lòng kiểm tra lại ngày và giờ học.');
      alert('Có các buổi học trùng lặp. Vui lòng kiểm tra lại ngày và giờ học.');
      return;
    }
    setScheduleEntriesError(null);

    // Validate start date is not in the past
    const today = getTodayDate();
    if (formData.startDate && formData.startDate < today) {
      alert('Ngày khai giảng không được là quá khứ!');
      setDateError('Ngày khai giảng không được là quá khứ!');
      return;
    }

    // Validate room capacity if room is selected
    if (formData.roomId) {
      const selectedRoom = rooms.find(r => (r._id || r.id) === formData.roomId);
      if (selectedRoom) {
        const roomCapacity = selectedRoom.capacity || selectedRoom.maxCapacity || selectedRoom.maxStudents;
        const studentCount = (selectedStudents || []).length;
        
        if (roomCapacity && studentCount > roomCapacity) {
          alert(`Số học viên (${studentCount}) vượt quá sức chứa của phòng (${roomCapacity} học viên). Vui lòng chọn phòng lớn hơn hoặc giảm số học viên.`);
          return;
        }
      }
    }

    // Ensure id is present before submitting
    if (!formData.id) {
      console.error('❌ [EditClassModal] Missing id in formData:', formData);
      alert('Lỗi: Không tìm thấy ID của lớp học. Vui lòng thử lại.');
      return;
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

    console.log('✅ [EditClassModal] Submitting class data:', {
      id: submitData.id,
      name: submitData.name,
      course: submitData.course,
      program: submitData.program,
      level: submitData.level
    });

    onSubmit(submitData);
  };

  return (
    <Modal show={true} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton className="bg-warning-600 text-white border-0 p-24">
        <Modal.Title className="fw-bold">
          <i className="fas fa-edit me-2"></i>
          Chỉnh sửa thông tin lớp học
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-24" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                  <Form.Label>Trạng thái</Form.Label>
                  <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                    {getStatusLabel(formData.status)}
                  </div>
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Chương trình <span className="text-danger-600">*</span>
                  </Form.Label>
                  {formData.status === 'pending' ? (
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
                    <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                      {typeToProgramMap[formData.program] || formData.program || '--'}
                    </div>
                  )}
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Cấp độ <span className="text-danger-600">*</span>
                  </Form.Label>
                  {formData.status === 'pending' ? (
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
                    <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                      {formData.level || '--'}
                    </div>
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
                  {formData.status === 'pending' ? (
                    <Form.Select
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      required
                      className="border-neutral-30 radius-8 px-16 py-10"
                      disabled={!formData.program || !formData.level || coursesLoading}
                    >
                      <option value="">
                        {coursesLoading ? 'Đang tải...' : !formData.program || !formData.level ? '-- Chọn chương trình và cấp độ trước --' : '-- Chọn course --'}
                      </option>
                      {(() => {
                        // Debug: Log courses state
                        if (courses.length > 0) {
                          console.log('📋 [EditClassModal] Rendering courses dropdown:', {
                            coursesCount: courses.length,
                            courses: courses.map(c => ({
                              id: c._id || c.id,
                              name: c.name,
                              numberOfSessions: c.numberOfSessions
                            })),
                            currentCourse: formData.course
                          });
                        } else if (!coursesLoading && formData.program && formData.level) {
                          console.warn('⚠️ [EditClassModal] No courses to render:', {
                            courses: courses,
                            program: formData.program,
                            level: formData.level,
                            coursesLoading
                          });
                        }
                        return courses.length > 0 ? (
                          courses.map(course => {
                            const courseId = course._id || course.id;
                            const courseName = course.name || '';
                            const sessions = course.numberOfSessions ? ` (${course.numberOfSessions} buổi)` : '';
                            return (
                              <option key={courseId} value={courseId}>
                                {courseName}{sessions}
                              </option>
                            );
                          })
                        ) : (
                          !coursesLoading && formData.program && formData.level && (
                            <option value="" disabled>Không có course nào</option>
                          )
                        );
                      })()}
                    </Form.Select>
                  ) : (
                    <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                      {selectedCourse ? `${selectedCourse.name}${selectedCourse.numberOfSessions ? ` (${selectedCourse.numberOfSessions} buổi)` : ''}` : (formData.course ? 'Đang tải...' : '--')}
                    </div>
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
                  {formData.status === 'pending' ? (
                    <>
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
                    </>
                  ) : (
                    <div className="d-flex align-items-center text-neutral-900 fw-medium" style={{ minHeight: '38px', paddingLeft: '4px' }}>
                      {formData.startDate ? new Date(formData.startDate).toLocaleDateString('vi-VN') : '--'}
                    </div>
                  )}
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-12">
              <Form.Label className="text-neutral-700 fw-medium mb-8">
                Thời khóa biểu <span className="text-danger-600">*</span>
              </Form.Label>
              {loadingClassData ? (
                <div className="text-neutral-500 text-13 mb-12 d-flex align-items-center gap-8">
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang tải thời khóa biểu từ database...
                </div>
              ) : (
                <p className="text-neutral-500 text-13 mb-0">
                  Thêm nhiều buổi học với ngày và giờ khác nhau (ví dụ: Thứ 2: 08:00-10:00, Thứ 4: 18:00-20:00).
                </p>
              )}
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
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Giáo viên</Form.Label>
                  <Form.Select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    className="border-neutral-30 radius-8 px-16 py-10"
                    disabled={teachers.length === 0}
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
                      : `Có ${teachers.length} giáo viên. Chọn lịch học để lọc giáo viên phù hợp.`}
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

              {studentSchedulesLoading ? (
                <div className="text-center text-neutral-500 py-20">
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Đang kiểm tra xung đột lịch học...
                </div>
              ) : (
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
                        const phone = student.phone || 'N/A';
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
                                    title="Học viên này có lịch học trùng giờ với lớp đang chỉnh sửa"
                                  >
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    Trùng giờ
                                  </span>
                                )}
                              </div>
                              <div className={`text-12 ${hasConflict ? 'text-danger-700' : 'text-neutral-500'}`}>
                                {email} {username && `• ${username}`} {phone && phone !== 'N/A' && `• ${phone}`}
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
              )}

              <Form.Text className="text-neutral-500 text-12 mt-8">
                <i className="fas fa-info-circle me-1"></i>
                Có thể thêm học viên sau khi chỉnh sửa lớp. File Excel cần có cột đầu tiên chứa Email hoặc Số điện thoại của học viên.
              </Form.Text>
              {!studentSchedulesLoading && conflictingStudentIds.size > 0 && (
                <Alert variant="warning" className="mt-12 mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Cảnh báo:</strong> Có {conflictingStudentIds.size} học viên bị trùng giờ học với lớp đang chỉnh sửa. 
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
            <i className="fas fa-times me-2"></i>
            Hủy
          </Button>
          <Button 
            className="btn-warning text-white text-15 fw-semibold px-24 py-10 radius-8"
            type="submit"
          >
            <i className="fas fa-save me-2"></i>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Form>

      {/* Select Student Modal */}
      <SelectStudentModal
        show={showSelectStudentModal}
        onClose={() => setShowSelectStudentModal(false)}
        onConfirm={handleStudentsConfirmed}
        initialSelectedStudents={selectedStudents}
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
    </Modal>
  );
};

export default EditClassModal;
