import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import classService from '../../services/classService';
import teacherService from '../../services/teacherService';
import roomService from '../../services/roomService';
import scheduleService from '../../services/scheduleService';

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
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState(null);

  useEffect(() => {
    // Reset studentsFetched when classData changes
    setStudentsFetched(false);
    
    if (classData) {
      console.log('🔍 [EditClassModal] Loading classData:', classData);
      console.log('🔍 [EditClassModal] All classData keys:', Object.keys(classData));
      console.log('🔍 [EditClassModal] Checking course fields:', {
        'classData.course': classData.course,
        'classData.courseId': classData.courseId,
        'classData.course_id': classData.course_id,
        'classData.Course': classData.Course,
        'classData.CourseId': classData.CourseId,
      });
      
      // Convert schedule to scheduleEntries format
      let scheduleEntries = [createEmptyScheduleEntry()];
      
      // Try to parse from schedules array first (more accurate)
      if (classData.schedules && Array.isArray(classData.schedules) && classData.schedules.length > 0) {
        // Group schedules by day and time to create scheduleEntries
        const scheduleMap = new Map();
        
        classData.schedules.forEach(schedule => {
          const date = new Date(schedule.date || schedule.scheduleDate || schedule.classDate);
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
      } else if (classData.schedule) {
        // Fallback: Parse schedule string to extract days and time
        const scheduleMatch = classData.schedule?.match(/T([2-7]|CN)-?([2-7]|CN)?-?([2-7]|CN)?, (\d{2}:\d{2})-(\d{2}:\d{2})/);
        
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
        classData.course?._id || 
        classData.course?.id || 
        classData.course ||
        classData.courseId ||
        classData.course_id ||
        classData.Course?._id ||
        classData.Course?.id ||
        classData.Course ||
        classData.CourseId ||
        '';
      // Convert to string to ensure consistent comparison
      const courseIdStr = courseId ? String(courseId) : '';

      console.log('🔍 [EditClassModal] Course extraction:', {
        'classData.course': classData.course,
        'classData.courseId': classData.courseId,
        'classData.Course': classData.Course,
        'courseId (raw)': courseId,
        'courseIdStr (final)': courseIdStr,
        'typeof courseId': typeof courseId,
        'typeof courseIdStr': typeof courseIdStr
      });

      console.log('🔍 [EditClassModal] Band from classData:', classData.band);
      console.log('🔍 [EditClassModal] ScheduleEntries:', scheduleEntries);

      // Debug students data
      console.log('🔍 [EditClassModal] ========== DEBUG STUDENTS ==========');
      console.log('🔍 [EditClassModal] classData.students:', classData.students);
      console.log('🔍 [EditClassModal] classData.students type:', typeof classData.students);
      console.log('🔍 [EditClassModal] classData.students isArray:', Array.isArray(classData.students));
      console.log('🔍 [EditClassModal] classData.students length:', classData.students?.length);
      
      // Check for alternative field names
      console.log('🔍 [EditClassModal] Checking alternative student fields:');
      console.log('  - classData.Students:', classData.Students);
      console.log('  - classData.studentList:', classData.studentList);
      console.log('  - classData.student_list:', classData.student_list);
      console.log('  - classData.members:', classData.members);
      
      // Log full classData structure for students
      if (classData.students) {
        console.log('🔍 [EditClassModal] First student sample:', classData.students[0]);
        console.log('🔍 [EditClassModal] All students:', JSON.stringify(classData.students, null, 2));
      }
      console.log('🔍 [EditClassModal] ====================================');

      setFormData({
        ...classData,
        course: courseIdStr,
        band: classData.band || '', // Ensure band is set from classData
        scheduleEntries
      });

      // Load students from classData - check multiple possible field names
      let studentsData = null;
      
      if (classData.students && Array.isArray(classData.students)) {
        studentsData = classData.students;
        console.log('✅ [EditClassModal] Found students in classData.students:', studentsData.length);
      } else if (classData.Students && Array.isArray(classData.Students)) {
        studentsData = classData.Students;
        console.log('✅ [EditClassModal] Found students in classData.Students:', studentsData.length);
      } else if (classData.studentList && Array.isArray(classData.studentList)) {
        studentsData = classData.studentList;
        console.log('✅ [EditClassModal] Found students in classData.studentList:', studentsData.length);
      } else if (classData.members && Array.isArray(classData.members)) {
        studentsData = classData.members;
        console.log('✅ [EditClassModal] Found students in classData.members:', studentsData.length);
      } else {
        console.warn('⚠️ [EditClassModal] No students found in classData, will fetch from API');
        studentsData = null; // Set to null to trigger API fetch
      }
      
      if (studentsData !== null) {
        setClassStudents(studentsData);
        setStudentsFetched(true); // Mark as fetched
        console.log('✅ [EditClassModal] Set classStudents to:', studentsData.length, 'students');
      } else {
        // Reset flag to allow API fetch
        setStudentsFetched(false);
        setClassStudents([]); // Set empty array first
        console.log('🌐 [EditClassModal] Will fetch students from API for class ID:', classData.id || classData._id);
      }
    }
  }, [classData]);

  // Fetch students from API if not found in classData
  useEffect(() => {
    const fetchStudentsFromAPI = async () => {
      if (!classData || (!classData.id && !classData._id)) {
        return;
      }

      // Skip if already fetched or if students are already in classData
      if (studentsFetched) {
        console.log('✅ [EditClassModal] Students already fetched, skipping API call');
        return;
      }

      if (classData.students && Array.isArray(classData.students) && classData.students.length > 0) {
        console.log('✅ [EditClassModal] Students already loaded from classData, skipping API fetch');
        return;
      }

      const classId = classData.id || classData._id;
      console.log('🌐 [EditClassModal] Fetching class details from API for ID:', classId);

      try {
        const response = await classService.getClassById(classId);
        console.log('✅ [EditClassModal] API Response:', response);

        if (response && response.success && response.class) {
          const fullClassData = response.class;
          console.log('✅ [EditClassModal] Full class data from API:', fullClassData);
          console.log('✅ [EditClassModal] Students from API:', fullClassData.students);

          if (fullClassData.students && Array.isArray(fullClassData.students)) {
            console.log('✅ [EditClassModal] Found', fullClassData.students.length, 'students from API');
            setClassStudents(fullClassData.students);
            setStudentsFetched(true); // Mark as fetched
          } else {
            console.warn('⚠️ [EditClassModal] No students in API response');
            setClassStudents([]);
            setStudentsFetched(true); // Mark as fetched even if empty
          }
        } else {
          console.warn('⚠️ [EditClassModal] API response does not have expected structure');
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
        console.log('🔍 [EditClassModal] Fetching teachers...');
        const response = await teacherService.getAllTeachers();
        console.log('📋 [EditClassModal] Teachers API Response:', response);
        
        if (response && (response.teachers || response.data)) {
          const fetchedTeachers = response.teachers || response.data || [];
          console.log('📋 [EditClassModal] Fetched teachers count:', fetchedTeachers.length);
          setTeachers(fetchedTeachers);
        } else {
          console.warn('⚠️ [EditClassModal] API response không có teachers hoặc data field:', response);
          setTeachers([]);
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Lỗi khi fetch teachers:', error);
        setTeachers([]);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log('🔍 [EditClassModal] Fetching rooms...');
        const response = await roomService.getAllRooms();
        console.log('📋 [EditClassModal] Rooms API Response:', response);
        
        if (response && (response.rooms || response.data)) {
          const fetchedRooms = response.rooms || response.data || [];
          console.log('📋 [EditClassModal] Fetched rooms count:', fetchedRooms.length);
          setRooms(fetchedRooms);
        } else {
          console.warn('⚠️ [EditClassModal] API response không có rooms hoặc data field:', response);
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
  const generatedSessions = useMemo(() => {
    if (!formData.startDate || !filledScheduleEntries.length || !selectedCourse?.numberOfSessions) {
      return [];
    }
    return generateSessions(formData.startDate, filledScheduleEntries, selectedCourse.numberOfSessions);
  }, [formData.startDate, filledScheduleEntries, selectedCourse?.numberOfSessions]);

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

  const handleScheduleEntryChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      scheduleEntries: prev.scheduleEntries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    }));
  };

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

  // Auto-fetch band when program and level are selected (only if band is not already set from classData)
  useEffect(() => {
    const fetchBand = async () => {
      console.log('🔍 [EditClassModal] fetchBand triggered, formData.band:', formData.band);
      
      // If band is already set from classData, don't fetch
      if (formData.band && formData.band.trim() !== '') {
        console.log('✅ [EditClassModal] Band already set from classData:', formData.band);
        return;
      }

      if (!formData.program || !formData.level) {
        console.log('⚠️ [EditClassModal] Program or level missing, not fetching band');
        // Don't clear band if it was set from classData
        return;
      }

      const type = getTypeFromProgram(formData.program);
      if (!type) {
        console.warn('⚠️ [EditClassModal] Cannot map program to type:', formData.program);
        // Don't clear band if we can't map program
        return;
      }

      console.log('🌐 [EditClassModal] Fetching band for:', { type, level: formData.level });

      try {
        const response = await axios.get('http://localhost:8080/api/v1/courses/band', {
          params: {
            type: type,
            level: formData.level
          }
        });

        console.log('✅ [EditClassModal] Band response:', response.data);

        if (response.data && response.data.success && response.data.band) {
          setFormData(prev => ({ ...prev, band: response.data.band }));
        } else {
          console.warn('⚠️ [EditClassModal] No band in response, keeping existing value');
          // Don't clear band if no mapping found, keep existing value
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching band:', error);
        // Don't clear band on error, keep existing value
      }
    };

    fetchBand();
  }, [formData.program, formData.level]);

  // No need to fetch courses list - we only display the course of this class

  // Fetch course details when course is set from classData
  useEffect(() => {
    const fetchCourseDetails = async () => {
      console.log('🔍 [EditClassModal] fetchCourseDetails triggered, formData.course:', formData.course);
      
      if (!formData.course) {
        console.log('⚠️ [EditClassModal] No course ID, setting selectedCourse to null');
        setSelectedCourse(null);
        return;
      }

      console.log('🌐 [EditClassModal] Fetching course details for ID:', formData.course);
      
      // Fetch course details to display course name
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/courses/${formData.course}/details`);
        console.log('✅ [EditClassModal] Course details response:', response.data);
        
        if (response.data && response.data.success && response.data.data) {
          console.log('✅ [EditClassModal] Setting selectedCourse:', response.data.data);
          setSelectedCourse(response.data.data);
        } else {
          console.warn('⚠️ [EditClassModal] Response does not have expected structure:', response.data);
          setSelectedCourse(null);
        }
      } catch (error) {
        console.error('❌ [EditClassModal] Error fetching course details:', error);
        console.error('❌ [EditClassModal] Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url
        });
        setSelectedCourse(null);
      }
    };

    fetchCourseDetails();
  }, [formData.course]);

  // Debug: Log when classStudents changes
  useEffect(() => {
    console.log('🔍 [EditClassModal] classStudents state changed:', classStudents);
    console.log('🔍 [EditClassModal] classStudents length:', classStudents.length);
    console.log('🔍 [EditClassModal] classStudents type:', typeof classStudents);
    console.log('🔍 [EditClassModal] classStudents isArray:', Array.isArray(classStudents));
  }, [classStudents]);

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

    // Validate start date is not in the past
    const today = getTodayDate();
    if (formData.startDate && formData.startDate < today) {
      alert('Ngày khai giảng không được là quá khứ!');
      setDateError('Ngày khai giảng không được là quá khứ!');
      return;
    }

    onSubmit(formData);
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
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Chờ khai giảng</option>
                    <option value="active">Đang học</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Chương trình <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                    disabled
                    readOnly
                    className="border-neutral-30 radius-8 px-16 py-10 bg-neutral-50"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Cấp độ <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="level"
                    value={formData.level || ''}
                    onChange={handleInputChange}
                    required
                    disabled
                    readOnly
                    className="border-neutral-30 radius-8 px-16 py-10 bg-neutral-50"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row g-3 mb-16">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Course <span className="text-danger-600">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCourse ? `${selectedCourse.name}${selectedCourse.numberOfSessions ? ` (${selectedCourse.numberOfSessions} buổi)` : ''}` : (formData.course ? 'Đang tải...' : '--')}
                    readOnly
                    disabled
                    className="border-neutral-30 radius-8 px-16 py-10 bg-neutral-50"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Band</Form.Label>
                  <Form.Control
                    type="text"
                    name="band"
                    value={formData.band || ''}
                    onChange={handleInputChange}
                    placeholder="VD: Band 1"
                    readOnly
                    className="border-neutral-30 radius-8 px-16 py-10 bg-neutral-50"
                  />
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
              {formData.scheduleEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="border border-neutral-100 rounded-12 p-16"
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
              ))}
            </div>

            <Button
              type="button"
              onClick={addScheduleEntry}
              className="btn-outline-main text-14 fw-medium px-16 py-8 radius-8 mt-16"
            >
              <i className="fas fa-plus me-2"></i>
              Thêm buổi học
            </Button>
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

          {/* Students List */}
          <div className="mb-24">
            <h5 className="text-neutral-900 fw-semibold mb-16 pb-12 border-bottom border-neutral-100">
              Danh sách học viên
            </h5>
            
            {(() => {
              console.log('🔍 [EditClassModal] RENDER - classStudents:', classStudents);
              console.log('🔍 [EditClassModal] RENDER - classStudents.length:', classStudents.length);
              console.log('🔍 [EditClassModal] RENDER - classStudents isArray:', Array.isArray(classStudents));
              if (classStudents.length > 0) {
                console.log('🔍 [EditClassModal] RENDER - First student:', classStudents[0]);
              }
              return null;
            })()}
            
            {classStudents.length === 0 ? (
              <div className="text-center text-neutral-500 py-20">
                <i className="fas fa-users me-2"></i>
                Lớp học chưa có học viên nào
              </div>
            ) : (
              <div 
                className="border border-neutral-100 rounded-12 p-16"
                style={{ maxHeight: '300px', overflowY: 'auto' }}
              >
                <div className="d-flex flex-column gap-8">
                  {classStudents.map((student, index) => {
                    console.log(`🔍 [EditClassModal] RENDER - Mapping student ${index}:`, student);
                    const studentId = student._id || student.id;
                    const displayName = student.fullName || student.name || student.username || student.email || 'N/A';
                    const email = student.email || 'N/A';
                    const username = student.username || 'N/A';
                    const phone = student.phone || 'N/A';
                    
                    console.log(`🔍 [EditClassModal] RENDER - Student ${index} processed:`, {
                      studentId,
                      displayName,
                      email,
                      username,
                      phone
                    });
                    
                    return (
                      <div
                        key={studentId || index}
                        className="d-flex align-items-center p-12 rounded-8 border border-neutral-100 bg-white"
                      >
                        <div className="d-flex align-items-center justify-content-center bg-main-100 text-main-600 rounded-circle me-12" 
                             style={{ width: '40px', height: '40px', fontSize: '16px', fontWeight: 'bold' }}>
                          {index + 1}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-medium text-neutral-900 text-14">
                            {displayName}
                          </div>
                          <div className="text-neutral-500 text-12">
                            {email} {username && `• ${username}`} {phone && phone !== 'N/A' && `• ${phone}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <Form.Text className="text-neutral-500 text-12 mt-8">
              <i className="fas fa-info-circle me-1"></i>
              Tổng số học viên: {classStudents.length}
            </Form.Text>
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
    </Modal>
  );
};

export default EditClassModal;
