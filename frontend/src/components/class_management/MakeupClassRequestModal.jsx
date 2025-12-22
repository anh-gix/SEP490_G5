import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Card } from 'react-bootstrap';
import { classScheduleService } from '../../services/classScheduleService';
import roomService from '../../services/roomService';
import teacherService from '../../services/teacherService';
import studentScheduleService from '../../services/studentScheduleService';

const MakeupClassRequestModal = ({ 
  show,
  // AcademicStaff mode props
  studentScheduleId,
  requestType = 'makeup_class', // 'makeup_class' or 'request_replace_teacher'
  senderSchedule = [],
  // Student mode props
  originalSchedule,
  studentId,
  studentSchedule = [],
  // Common props
  onClose, 
  onSubmit,
  loading = false
}) => {
  // Determine mode
  const isAcademicStaffMode = !!studentScheduleId;
  const isStudentMode = !!originalSchedule && !studentScheduleId;
  const effectiveRequestType = requestType || 'makeup_class';

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    teacher: '',
    reason: '' // Only for Student mode
  });
  
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [validating, setValidating] = useState(false);
  const [conflicts, setConflicts] = useState(null);
  const [error, setError] = useState(null);
  
  // States for existing schedule selection (for makeup_class)
  const [makeupOption, setMakeupOption] = useState('existing');
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedExistingScheduleId, setSelectedExistingScheduleId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [currentClassScheduleId, setCurrentClassScheduleId] = useState(null);
  
  // State for substitute teacher (for request_replace_teacher)
  const [selectedSubstituteTeacherId, setSelectedSubstituteTeacherId] = useState('');
  const [teacherConflict, setTeacherConflict] = useState(null);
  const [checkingTeacherConflict, setCheckingTeacherConflict] = useState(false);
  
  // State to track conflicted substitute teachers (for request_replace_teacher)
  const [conflictedSubstituteTeacherIds, setConflictedSubstituteTeacherIds] = useState(new Set());
  
  // Original schedule info
  const [originalScheduleInfo, setOriginalScheduleInfo] = useState(null);
  const [loadingOriginalSchedule, setLoadingOriginalSchedule] = useState(false);

  // State to track if date and time are selected (for sequential form)
  const [isDateTimeSelected, setIsDateTimeSelected] = useState(false);
  
  // State to track conflicted rooms (rooms that have schedule conflicts with selected time)
  const [conflictedRoomIds, setConflictedRoomIds] = useState(new Set());
  
  // State to track conflicted teachers (teachers that have schedule conflicts with selected time)
  const [conflictedTeacherIds, setConflictedTeacherIds] = useState(new Set());
  
  // State to track student schedule conflicts
  const [studentScheduleConflict, setStudentScheduleConflict] = useState(null);

  // Load original schedule info when modal opens
  useEffect(() => {
    if (show) {
      if (isAcademicStaffMode && studentScheduleId) {
        fetchOriginalSchedule();
        fetchRooms();
        fetchTeachers();
        resetForm();
      } else if (isStudentMode && originalSchedule) {
        fetchRooms();
        fetchTeachers();
        resetForm();
        // For Student mode, originalSchedule is passed directly
        // May need to fetch ClassSchedule to get sessionId
        if (originalSchedule.studentScheduleId) {
          fetchClassScheduleForSessionId(originalSchedule.studentScheduleId);
        }
      }
    }
  }, [show, studentScheduleId, originalSchedule, isAcademicStaffMode, isStudentMode]);

  // Fetch available schedules when option is 'existing' and sessionId is available
  useEffect(() => {
    if (show && effectiveRequestType === 'makeup_class' && makeupOption === 'existing' && originalScheduleInfo) {
      fetchAvailableSchedules();
    } else if (show && effectiveRequestType === 'makeup_class' && makeupOption === 'existing' && isStudentMode && originalSchedule) {
      fetchAvailableSchedules();
    }
  }, [show, makeupOption, originalScheduleInfo, originalSchedule, sessionId, effectiveRequestType, isStudentMode]);

  // Check if date and time are selected (for sequential form when creating new makeup class)
  useEffect(() => {
    if (makeupOption === 'new') {
      const hasDate = !!formData.date;
      const hasStartTime = !!formData.startTime;
      const hasEndTime = !!formData.endTime;
      const allDateTimeSelected = hasDate && hasStartTime && hasEndTime;
      
      setIsDateTimeSelected(allDateTimeSelected);
      
      // Clear room and teacher if date/time changes (user needs to reselect)
      if (!allDateTimeSelected && (formData.room || formData.teacher)) {
        setFormData(prev => ({
          ...prev,
          room: '',
          teacher: ''
        }));
        setConflicts(null);
      }
    } else {
      // Reset when switching to 'existing' option
      setIsDateTimeSelected(false);
    }
  }, [formData.date, formData.startTime, formData.endTime, makeupOption]);

  // Check room conflicts for the selected date when date/time is selected
  useEffect(() => {
    const checkRoomConflicts = async () => {
      if (makeupOption === 'new' && isDateTimeSelected && formData.date && formData.startTime && formData.endTime && rooms.length > 0) {
        try {
          const conflictedRooms = new Set();
          
          // Fetch schedules for all rooms in parallel
          const schedulePromises = rooms.map(async (room) => {
            try {
              const roomId = room._id || room.id;
              const response = await roomService.getRoomSchedule(roomId, { date: formData.date });
              
              return {
                roomId: roomId,
                schedules: response.schedules || []
              };
            } catch (error) {
              return {
                roomId: room._id || room.id,
                schedules: []
              };
            }
          });
          
          const results = await Promise.all(schedulePromises);
          
          // Check for conflicts
          results.forEach((roomData) => {
            let hasConflict = false;
            
            roomData.schedules.forEach((schedule) => {
              // Check if this schedule conflicts with selected time
              if (schedule.startTime && schedule.endTime) {
                const conflict = hasTimeOverlap(
                    formData.startTime,
                    formData.endTime,
                    schedule.startTime,
                    schedule.endTime
                  );
                
                if (conflict) {
                  hasConflict = true;
                }
              }
            });
            
            if (hasConflict) {
              conflictedRooms.add(String(roomData.roomId));
            }
          });
          
          // Update conflicted rooms state
          setConflictedRoomIds(conflictedRooms);
          
          // Clear selected room if it becomes conflicted
          if (formData.room && conflictedRooms.has(String(formData.room))) {
            setFormData(prev => ({
              ...prev,
              room: ''
            }));
            setConflicts(null);
          }
          
        } catch (error) {
          // Silent error handling
        }
      } else {
        // Clear conflicted rooms when date/time is not selected
        setConflictedRoomIds(new Set());
      }
    };
    
    checkRoomConflicts();
  }, [isDateTimeSelected, formData.date, formData.startTime, formData.endTime, makeupOption, rooms]);

  // Check teacher conflicts for the selected date when date/time is selected
  useEffect(() => {
    const checkTeacherConflicts = async () => {
      if (makeupOption === 'new' && isDateTimeSelected && formData.date && formData.startTime && formData.endTime && teachers.length > 0) {
        try {
          const conflictedTeachers = new Set();
          
          // Fetch schedules for all teachers in parallel
          const schedulePromises = teachers.map(async (teacher) => {
            try {
              const teacherId = teacher._id || teacher.id;
              // Use the same date for startDate and endDate to get schedules for that specific day
              const response = await teacherService.getTeacherSchedule(teacherId, { 
                startDate: formData.date, 
                endDate: formData.date 
              });
              
              return {
                teacherId: teacherId,
                schedules: response.schedules || []
              };
            } catch (error) {
              return {
                teacherId: teacher._id || teacher.id,
                schedules: []
              };
            }
          });
          
          const results = await Promise.all(schedulePromises);
          
          // Check for conflicts
          results.forEach((teacherData) => {
            let hasConflict = false;
            
            teacherData.schedules.forEach((schedule) => {
              // Check if this schedule conflicts with selected time
              if (schedule.startTime && schedule.endTime) {
                const conflict = hasTimeOverlap(
                    formData.startTime,
                    formData.endTime,
                    schedule.startTime,
                    schedule.endTime
                  );
                
                if (conflict) {
                  hasConflict = true;
                }
              }
            });
            
            if (hasConflict) {
              conflictedTeachers.add(String(teacherData.teacherId));
            }
          });
          
          // Update conflicted teachers state
          setConflictedTeacherIds(conflictedTeachers);
          
          // Clear selected teacher if it becomes conflicted
          if (formData.teacher && conflictedTeachers.has(String(formData.teacher))) {
            setFormData(prev => ({
              ...prev,
              teacher: ''
            }));
            setConflicts(null);
          }
          
        } catch (error) {
          // Silent error handling
        }
      } else {
        // Clear conflicted teachers when date/time is not selected
        setConflictedTeacherIds(new Set());
      }
    };
    
    checkTeacherConflicts();
  }, [isDateTimeSelected, formData.date, formData.startTime, formData.endTime, makeupOption, teachers]);

  // Check substitute teacher conflicts when modal opens (for request_replace_teacher)
  useEffect(() => {
    const checkSubstituteTeacherConflicts = async () => {
      if (show && effectiveRequestType === 'request_replace_teacher' && originalScheduleInfo && teachers.length > 0) {
        try {
          const conflictedTeachers = new Set();
          
          // Check conflicts for all teachers in parallel
          const conflictPromises = teachers.map(async (teacher) => {
            try {
              const teacherId = teacher._id || teacher.id;
              
              // Skip current teacher
              const currentTeacherId = originalScheduleInfo.teacher?.toString();
              if (teacherId.toString() === currentTeacherId) {
                return { teacherId, hasConflict: false };
              }
              
              const response = await classScheduleService.validateScheduleConflictSimple({
                date: originalScheduleInfo.date,
                startTime: originalScheduleInfo.startTime,
                endTime: originalScheduleInfo.endTime,
                room: originalScheduleInfo.room,
                teacher: teacherId,
                studentId: null,
                excludeScheduleId: originalScheduleInfo.classScheduleId
              });
              
              const hasConflict = response.success && response.conflicts?.teacher?.length > 0;
              return { teacherId, hasConflict };
            } catch (error) {
              // On error, assume no conflict to be safe
              return { teacherId: teacher._id || teacher.id, hasConflict: false };
            }
          });
          
          const results = await Promise.all(conflictPromises);
          
          results.forEach(({ teacherId, hasConflict }) => {
            if (hasConflict) {
              conflictedTeachers.add(String(teacherId));
            }
          });
          
          setConflictedSubstituteTeacherIds(conflictedTeachers);
        } catch (error) {
          console.error('Error checking substitute teacher conflicts:', error);
        }
      } else {
        setConflictedSubstituteTeacherIds(new Set());
      }
    };
    
    checkSubstituteTeacherConflicts();
  }, [show, effectiveRequestType, originalScheduleInfo, teachers]);

  // Log student schedule for the selected date when date/time is selected
  useEffect(() => {
    const logStudentSchedule = async () => {
      if (makeupOption === 'new' && isDateTimeSelected && formData.date && formData.startTime && formData.endTime) {
        try {
          let targetStudentId = null;
          
          // Determine student ID based on mode
          if (isStudentMode && studentId) {
            targetStudentId = studentId;
          } else if (isAcademicStaffMode && studentScheduleId) {
            // For AcademicStaff mode, need to get studentId from studentScheduleId
            try {
              const response = await studentScheduleService.getClassScheduleByStudentScheduleId(studentScheduleId);
              if (response.success && response.studentSchedule?.student) {
                targetStudentId = response.studentSchedule.student._id || response.studentSchedule.student;
              }
            } catch (error) {
              console.error('[DEBUG] Error fetching studentId:', error);
              return;
            }
          }

          if (!targetStudentId) {
            return;
          }
          
          // Get student schedule for the selected date
          // Use the same date for startDate and endDate to get schedules for that specific day
          const apiPort = import.meta.env.VITE_API_PORT || 8080;
          const apiUrl = `http://localhost:${apiPort}/api/student-schedules/student/${targetStudentId}/schedule?startDate=${formData.date}&endDate=${formData.date}`;

          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            // API returns schedules array directly, not wrapped in success field
            if (data.schedules && Array.isArray(data.schedules)) {
              const schedulesOnDate = data.schedules;

              if (schedulesOnDate.length === 0) {
                // Clear conflict when no schedules
                setStudentScheduleConflict(null);
              } else {
                let hasStudentConflict = false;
                let conflictSchedule = null;

                schedulesOnDate.forEach((schedule, index) => {
                  // Check if this schedule conflicts with selected time
                  if (schedule.startTime && schedule.endTime) {
                    const conflict = hasTimeOverlap(
                      formData.startTime,
                      formData.endTime,
                      schedule.startTime,
                      schedule.endTime
                    );

                    if (conflict) {
                      hasStudentConflict = true;
                      conflictSchedule = schedule;
                    }
                  }
                });
                
                // Update student schedule conflict state
                if (hasStudentConflict && conflictSchedule) {
                  setStudentScheduleConflict({
                    hasConflict: true,
                    className: conflictSchedule.className || 'N/A',
                    timeRange: `${conflictSchedule.startTime} - ${conflictSchedule.endTime}`,
                    roomName: conflictSchedule.room?.room_name || 'N/A',
                    sessionTitle: conflictSchedule.sessionTitle || 'N/A'
                  });
                } else {
                  setStudentScheduleConflict(null);
                }
              }
            }
          } else {
            const errorText = await response.text();
            console.error('[DEBUG] API error:', response.status, errorText);
            // Clear conflict on error
            setStudentScheduleConflict(null);
          }
        } catch (error) {
          console.error('[DEBUG] Error in logStudentSchedule:', error);
          // Clear conflict on error
          setStudentScheduleConflict(null);
        }
      } else {
        // Clear conflict when date/time is not selected or makeupOption is not 'new'
        setStudentScheduleConflict(null);
      }
    };
    
    logStudentSchedule();
  }, [isDateTimeSelected, formData.date, formData.startTime, formData.endTime, makeupOption, studentId, studentScheduleId, isStudentMode, isAcademicStaffMode]);

  const resetForm = () => {
    setFormData({
      date: '',
      startTime: originalSchedule?.startTime || '',
      endTime: originalSchedule?.endTime || '',
      room: '',
      teacher: originalSchedule?.teacherId || '',
      reason: ''
    });
    setConflicts(null);
    setError(null);
    setMakeupOption('existing');
    setSelectedExistingScheduleId('');
    setSelectedClassId('');
    setSelectedSubstituteTeacherId('');
    setAvailableSchedules([]);
    setSessionId(null);
    setCurrentClassScheduleId(null);
    setIsDateTimeSelected(false);
    setConflictedRoomIds(new Set());
    setConflictedTeacherIds(new Set());
    setStudentScheduleConflict(null);
    setConflictedSubstituteTeacherIds(new Set());
  };

  const fetchOriginalSchedule = async () => {
    if (!studentScheduleId) return;
    
    try {
      setLoadingOriginalSchedule(true);
      const response = await studentScheduleService.getClassScheduleByStudentScheduleId(studentScheduleId);
      
      if (response.success && response.classSchedule) {
        const classSchedule = response.classSchedule;
        setOriginalScheduleInfo({
          studentScheduleId: studentScheduleId,
          classScheduleId: classSchedule._id,
          classId: classSchedule.class?._id,
          className: classSchedule.class?.name || 'N/A',
          date: classSchedule.date,
          startTime: classSchedule.startTime,
          endTime: classSchedule.endTime,
          room: classSchedule.room?._id || classSchedule.room,
          roomName: classSchedule.room?.room_name || 'N/A',
          teacher: classSchedule.teacher?._id || classSchedule.teacher,
          teacherName: classSchedule.teacher?.username || classSchedule.teacher?.fullName || 'N/A',
          sessionId: classSchedule.session?._id,
          sessionTitle: classSchedule.session?.title,
          sessionOrder: classSchedule.session?.order
        });
        
        // Set sessionId and currentClassScheduleId for fetching available schedules
        if (classSchedule.session?._id) {
          setSessionId(classSchedule.session._id);
          setCurrentClassScheduleId(classSchedule._id);
        }
        
        // Pre-fill form with original schedule info
        setFormData(prev => ({
          ...prev,
          startTime: classSchedule.startTime || '',
          endTime: classSchedule.endTime || ''
        }));
      }
    } catch (err) {
      console.error('Error fetching original schedule:', err);
      setError('Không thể tải thông tin buổi học');
    } finally {
      setLoadingOriginalSchedule(false);
    }
  };

  const fetchClassScheduleForSessionId = async (studentScheduleId) => {
    try {
      const response = await studentScheduleService.getClassScheduleByStudentScheduleId(studentScheduleId);
      if (response.success && response.classSchedule?.session?._id) {
        setSessionId(response.classSchedule.session._id);
        setCurrentClassScheduleId(response.classSchedule._id);
      }
    } catch (err) {
      console.error('Error fetching ClassSchedule for sessionId:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAllRooms({ status: 'available' });
      setRooms(response.rooms || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Không thể tải danh sách phòng học');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAllTeachers({ status: 'active' });
      setTeachers(response.teachers || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Không thể tải danh sách giáo viên');
    }
  };

  // Helper function to parse date string to local date (avoid timezone issues)
  const parseDateToLocal = (dateString) => {
    if (!dateString) return null;
    
    // If date string is in YYYY-MM-DD format, parse directly
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1; // Month is 0-indexed
      const day = parseInt(dateMatch[3], 10);
      return new Date(year, month, day);
    }
    
    // Fallback to regular Date parsing
    return new Date(dateString);
  };

  // Helper function to format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (date) => {
    if (!date) return '';
    const d = parseDateToLocal(date);
    if (!d || isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to format date for display (avoid timezone issues)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = parseDateToLocal(dateString);
    if (!date || isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to check time overlap
  const hasTimeOverlap = (start1, end1, start2, end2) => {
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);
    
    return start1Min < end2Min && end1Min > start2Min;
  };

  // Unified conflict checking function
  const hasConflictWithSchedule = (schedule, scheduleList) => {
    if (!scheduleList || scheduleList.length === 0) {
      return false;
    }

    if (!schedule.date || !schedule.startTime || !schedule.endTime) {
      return false;
    }

    const scheduleDate = formatDateToYYYYMMDD(schedule.date);
    
    const schedulesSameDate = scheduleList.filter(sch => {
      if (!sch.date || !sch.startTime || !sch.endTime) {
        return false;
      }
      const schDate = formatDateToYYYYMMDD(sch.date);
      return schDate === scheduleDate;
    });

    for (const sch of schedulesSameDate) {
      if (sch.scheduleStatus === 'cancelled' || sch.scheduleStatus === 'rescheduled') {
        continue;
      }
      
      if (hasTimeOverlap(
        schedule.startTime,
        schedule.endTime,
        sch.startTime,
        sch.endTime
      )) {
        return true;
      }
    }

    return false;
  };

  const fetchAvailableSchedules = async () => {
    let sessionIdToUse = sessionId;
    let currentScheduleInfo = originalScheduleInfo || originalSchedule;
    
    // Fetch student schedule for conflict checking (AcademicStaff mode)
    let studentScheduleForConflict = senderSchedule || [];
    if (isAcademicStaffMode && studentScheduleId) {
      try {
        // Get studentId from studentScheduleId
        const response = await studentScheduleService.getClassScheduleByStudentScheduleId(studentScheduleId);
        if (response.success && response.studentSchedule?.student) {
          const targetStudentId = response.studentSchedule.student._id || response.studentSchedule.student;
          
          // Fetch full student schedule for conflict checking
          const apiPort = import.meta.env.VITE_API_PORT || 8080;
          const scheduleResponse = await fetch(
            `http://localhost:${apiPort}/api/student-schedules/student/${targetStudentId}/schedule`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json();
            if (scheduleData.schedules && Array.isArray(scheduleData.schedules)) {
              // Convert to format compatible with hasConflictWithSchedule
              studentScheduleForConflict = scheduleData.schedules.map(s => ({
                date: s.date,
                startTime: s.startTime,
                endTime: s.endTime,
                scheduleStatus: s.scheduleStatus
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching student schedule for conflict check:', error);
        // Fallback to senderSchedule
      }
    }
    
    // For Student mode, try to get sessionId if not available
    if (isStudentMode && !sessionIdToUse && originalSchedule?.studentScheduleId) {
      try {
        const response = await studentScheduleService.getClassScheduleByStudentScheduleId(
          originalSchedule.studentScheduleId
        );
        if (response.success && response.classSchedule?.session?._id) {
          sessionIdToUse = response.classSchedule.session._id;
          setSessionId(sessionIdToUse);
          setCurrentClassScheduleId(response.classSchedule._id);
        }
      } catch (err) {
        console.error('Error fetching ClassSchedule for sessionId:', err);
      }
    }
    
    if (!sessionIdToUse) {
      // Fallback: try using sessionOrder for Student mode
      if (isStudentMode && originalSchedule) {
        const sessionOrder = originalSchedule.lessonNumber || originalSchedule.sessionOrder;
        if (sessionOrder) {
          try {
            setLoadingSchedules(true);
            const apiPort = import.meta.env.VITE_API_PORT || 8080;
            const today = new Date().toISOString();
            const response = await fetch(
              `http://localhost:${apiPort}/api/class-schedules/by-session?sessionOrder=${sessionOrder}&dateAfter=${today}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (response.ok) {
              const data = await response.json();
              const filtered = (data.classSchedules || []).filter(schedule => {
                const scheduleId = (schedule._id || schedule.id)?.toString();
                if (currentClassScheduleId && scheduleId === currentClassScheduleId.toString()) {
                  return false;
                }
                if (isStudentMode && hasConflictWithSchedule(schedule, studentSchedule)) {
                  return false;
                }
                if (isAcademicStaffMode && hasConflictWithSchedule(schedule, studentScheduleForConflict)) {
                  return false;
                }
                return true;
              });
              setAvailableSchedules(filtered);
            } else {
              setAvailableSchedules([]);
            }
          } catch (error) {
            console.error('Error fetching available schedules:', error);
            setAvailableSchedules([]);
          } finally {
            setLoadingSchedules(false);
          }
          return;
        }
      }
      setAvailableSchedules([]);
      return;
    }
    
    try {
      setLoadingSchedules(true);
      
      const apiPort = import.meta.env.VITE_API_PORT || 8080;
      const today = new Date().toISOString();
      const response = await fetch(
        `http://localhost:${apiPort}/api/class-schedules/by-session?sessionId=${sessionIdToUse}&dateAfter=${today}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const classSchedules = data.classSchedules || [];
        
        // Filter to exclude current schedule and conflicts
        const filtered = classSchedules.filter(schedule => {
          const scheduleId = (schedule._id || schedule.id)?.toString();
          if (currentClassScheduleId && scheduleId === currentClassScheduleId.toString()) {
            return false;
          }
          
          // Check conflicts based on mode
          if (isStudentMode && hasConflictWithSchedule(schedule, studentSchedule)) {
            return false;
          }
          if (isAcademicStaffMode && hasConflictWithSchedule(schedule, studentScheduleForConflict)) {
            return false;
          }
          
          // Filter out past sessions (including today's sessions that have already ended)
          if (schedule.date) {
            const scheduleDate = new Date(schedule.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const scheduleDateOnly = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
            
            if (scheduleDateOnly < today) {
              return false;
            }
            
            if (scheduleDateOnly.getTime() === today.getTime()) {
              if (schedule.endTime) {
                const timeParts = schedule.endTime.split(':');
                if (timeParts.length >= 2) {
                  const endHours = parseInt(timeParts[0], 10);
                  const endMinutes = parseInt(timeParts[1], 10);
                  if (!isNaN(endHours) && !isNaN(endMinutes)) {
                    const now = new Date();
                    const currentTime = now.getHours() * 60 + now.getMinutes();
                    const scheduleEndTime = endHours * 60 + endMinutes;
                    if (scheduleEndTime < currentTime) {
                      return false;
                    }
                  }
                }
              }
            }
          }
          
          return true;
        });
        
        setAvailableSchedules(filtered);
      } else {
        setAvailableSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching available schedules:', error);
      setAvailableSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (conflicts) {
      setConflicts(null);
    }
  };

  const validateConflict = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.room || !formData.teacher) {
      return false;
    }
  
    try {
      setValidating(true);
      // Get student ID based on mode
      let studentIdToValidate = null;
      if (isStudentMode) {
        studentIdToValidate = studentId;
      } else if (isAcademicStaffMode && senderSchedule && senderSchedule.length > 0) {
        const firstSchedule = senderSchedule[0];
        studentIdToValidate = firstSchedule.student?._id || firstSchedule.student || null;
      }
      
      // Get schedule ID to exclude (if editing an existing makeup schedule)
      let excludeScheduleId = null;
      if (isStudentMode && originalSchedule?.studentScheduleId) {
        // For Student mode, we need to get the ClassSchedule ID from StudentSchedule
        try {
          const response = await studentScheduleService.getClassScheduleByStudentScheduleId(
            originalSchedule.studentScheduleId
          );
          if (response.success && response.classSchedule?._id) {
            excludeScheduleId = response.classSchedule._id;
          }
        } catch (err) {
          console.error('Error fetching ClassSchedule for excludeScheduleId:', err);
        }
      } else if (isAcademicStaffMode && originalScheduleInfo?.classScheduleId) {
        excludeScheduleId = originalScheduleInfo.classScheduleId;
      }
      
      const response = await classScheduleService.validateScheduleConflictSimple({
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        room: formData.room,
        teacher: formData.teacher,
        studentId: studentIdToValidate,
        excludeScheduleId: excludeScheduleId // Exclude current makeup schedule from conflict check
      });
  
      if (response.success) {
        setConflicts(response);
        return !response.hasConflict;
      }
      return false;
    } catch (err) {
      console.error('Error validating conflict:', err);
      setError('Không thể kiểm tra xung đột lịch học');
      return false;
    } finally {
      setValidating(false);
    }
  };

  const checkSubstituteTeacherConflict = async (teacherId) => {
    if (!teacherId || !originalScheduleInfo) {
      setTeacherConflict(null);
      return;
    }

    if (!originalScheduleInfo.date || !originalScheduleInfo.startTime || 
        !originalScheduleInfo.endTime || !originalScheduleInfo.room) {
      console.error('Missing schedule info:', originalScheduleInfo);
      setError('Thiếu thông tin buổi học để kiểm tra xung đột');
      return;
    }

    try {
      setCheckingTeacherConflict(true);
      setTeacherConflict(null);

      const response = await classScheduleService.validateScheduleConflictSimple({
        date: originalScheduleInfo.date,
        startTime: originalScheduleInfo.startTime,
        endTime: originalScheduleInfo.endTime,
        room: originalScheduleInfo.room,
        teacher: teacherId,
        studentId: null,
        excludeScheduleId: originalScheduleInfo.classScheduleId
      });

      if (response.success && response.conflicts?.teacher?.length > 0) {
        setTeacherConflict({
          hasConflict: true,
          conflicts: response.conflicts.teacher
        });
      } else {
        setTeacherConflict({
          hasConflict: false,
          conflicts: []
        });
      }
    } catch (err) {
      console.error('Error checking teacher conflict:', err);
      setError('Không thể kiểm tra xung đột lịch dạy của giáo viên');
    } finally {
      setCheckingTeacherConflict(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (effectiveRequestType === 'request_replace_teacher') {
      // Handle substitute teacher (AcademicStaff only)
      if (!selectedSubstituteTeacherId) {
        setError('Vui lòng chọn giáo viên dạy thay');
        return;
      }

      const substituteTeacher = teachers.find(t => 
        (t._id || t.id)?.toString() === selectedSubstituteTeacherId
      );

      if (!substituteTeacher) {
        setError('Giáo viên được chọn không hợp lệ');
        return;
      }

      // Submit with substitute teacher data (AcademicStaff format)
      onSubmit({
        absentScheduleId: studentScheduleId,
        substituteTeacherId: selectedSubstituteTeacherId,
        isSubstituteClass: true,
        substituteTeacherInfo: {
          _id: substituteTeacher._id || substituteTeacher.id,
          username: substituteTeacher.username,
          fullName: substituteTeacher.fullName,
          name: substituteTeacher.name
        }
      });
    } else {
      // Handle makeup class
      if (makeupOption === 'existing') {
        // Choose existing schedule
        if (!selectedExistingScheduleId) {
          setError('Vui lòng chọn buổi học bù');
          return;
        }

        const selectedSchedule = availableSchedules.find(
          s => (s._id || s.id)?.toString() === selectedExistingScheduleId
        );

        if (!selectedSchedule) {
          setError('Buổi học được chọn không hợp lệ');
          return;
        }

        // For Student mode, validate conflict
        if (isStudentMode) {
          try {
            const validateResponse = await classScheduleService.validateMakeupClassSchedule(
              selectedExistingScheduleId,
              studentId
            );

            if (validateResponse.success && validateResponse.hasConflict) {
              if (!window.confirm('Có xung đột lịch học. Bạn có chắc chắn muốn tiếp tục?')) {
                return;
              }
            }
          } catch (err) {
            console.error('Error validating:', err);
          }
        }

        // Submit based on mode
        if (isAcademicStaffMode) {
          // AcademicStaff format
          const makeupScheduleId = selectedSchedule._id || selectedSchedule.id;
          const makeupClassId = selectedSchedule.class?._id || selectedSchedule.classId;

          onSubmit({
            absentScheduleId: studentScheduleId,
            makeupScheduleId: makeupScheduleId,
            makeupClassId: makeupClassId,
            isSubstituteClass: false,
            makeupSchedule: {
              _id: makeupScheduleId,
              id: makeupScheduleId,
              date: selectedSchedule.date,
              startTime: selectedSchedule.startTime,
              endTime: selectedSchedule.endTime,
              title: selectedSchedule.session?.title,
              order: selectedSchedule.session?.order,
              class: selectedSchedule.class
            },
            makeupClassInfo: {
              className: selectedSchedule.class?.name || 'N/A',
              classId: makeupClassId
            }
          });
        } else {
          // Student format
          onSubmit({
            existingScheduleId: selectedExistingScheduleId,
            originalSchedule: originalSchedule
          });
        }
      } else {
        // Create new makeup class
        if (!formData.date || !formData.startTime || !formData.endTime || !formData.room || !formData.teacher) {
          setError('Vui lòng điền đầy đủ thông tin bắt buộc');
          return;
        }

        // Check student schedule conflict
        if (studentScheduleConflict && studentScheduleConflict.hasConflict) {
          setError(`Không thể tạo buổi học bù: Học viên đã có buổi học "${studentScheduleConflict.className}" vào thời gian ${studentScheduleConflict.timeRange} trong ngày này. Vui lòng chọn thời gian khác.`);
          return;
        }

        // Validate conflict
        const isValid = await validateConflict();
        if (!isValid) {
          const conflictMessages = [];
          if (conflicts?.conflicts?.room?.length > 0) {
            conflictMessages.push(`Phòng học đã được sử dụng (${conflicts.conflicts.room.length} xung đột)`);
          }
          if (conflicts?.conflicts?.teacher?.length > 0) {
            conflictMessages.push(`Giáo viên đã có lịch dạy (${conflicts.conflicts.teacher.length} xung đột)`);
          }
          if (conflicts?.conflicts?.students?.length > 0) {
            conflictMessages.push(`Học viên đã có lịch học (${conflicts.conflicts.students.length} xung đột)`);
          }
          const errorMsg = conflictMessages.length > 0 
            ? `Có xung đột lịch học: ${conflictMessages.join(', ')}. Vui lòng xem chi tiết bên dưới và chọn thời gian khác.`
            : 'Có xung đột lịch học. Vui lòng chọn thời gian khác.';
          setError(errorMsg);
          return;
        }

        // Submit based on mode
        if (isAcademicStaffMode) {
          // AcademicStaff format
          const newMakeupSessionId = originalScheduleInfo?.sessionId || null;

          onSubmit({
            absentScheduleId: studentScheduleId,
            isSubstituteClass: false,
            isNewMakeup: true,
            newMakeupDate: formData.date,
            newMakeupStartTime: formData.startTime,
            newMakeupEndTime: formData.endTime,
            newMakeupRoomId: formData.room,
            newMakeupTeacherId: formData.teacher,
            newMakeupSessionId: newMakeupSessionId,
            makeupSchedule: {
              date: formData.date,
              startTime: formData.startTime,
              endTime: formData.endTime,
              title: originalScheduleInfo?.sessionTitle || 'Buổi học bù',
              order: originalScheduleInfo?.sessionOrder || null
            },
            makeupClassInfo: {
              className: originalScheduleInfo?.className || 'Lớp học bù'
            }
          });
        } else {
          // Student format
          onSubmit({
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            room: formData.room,
            teacher: formData.teacher,
            reason: formData.reason || 'Buổi học bù',
            originalSchedule: originalSchedule
          });
        }
      }
    }
  };

  if (!show) return null;

  // Get original schedule info for display
  const displayScheduleInfo = isAcademicStaffMode ? originalScheduleInfo : originalSchedule;

  const modalTitle = effectiveRequestType === 'request_replace_teacher' 
    ? 'Xếp giáo viên dạy thay' 
    : 'Xếp buổi học bù';
  const modalHeaderClass = effectiveRequestType === 'request_replace_teacher' 
    ? 'bg-info text-white' 
    : 'bg-warning text-white';

  return (
    <Modal show={show} onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className={`${modalHeaderClass} border-0 p-24`}>
        <Modal.Title className="fw-bold">
          <i className="fas fa-calendar-plus me-2"></i>
          {modalTitle}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-24" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Original schedule info */}
          {isAcademicStaffMode && loadingOriginalSchedule ? (
            <div className="text-center py-3">
              <i className="fas fa-spinner fa-spin me-2"></i>
              Đang tải thông tin buổi học...
            </div>
          ) : displayScheduleInfo && (
            <Card className="mb-20 bg-warning-25 border border-warning-200 rounded-12" style={{ borderLeft: '4px solid #FF9800' }}>
              <Card.Header className="bg-warning-50 border-0 rounded-top-12 p-16">
                <h5 className="mb-0 text-neutral-900 fw-semibold">Thông tin buổi học gốc</h5>
              </Card.Header>
              <Card.Body className="p-20">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Lớp:</strong> 
                      <span className="text-neutral-700 ms-2">
                        {displayScheduleInfo.className || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Ngày học:</strong> 
                      <span className="text-neutral-700 ms-2">
                        {isAcademicStaffMode 
                          ? formatDateForDisplay(displayScheduleInfo.date) || 'N/A'
                          : displayScheduleInfo.date ? new Date(displayScheduleInfo.date).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Thời gian:</strong> 
                      <span className="text-neutral-700 ms-2">
                        {displayScheduleInfo.startTime || 'N/A'} - {displayScheduleInfo.endTime || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Phòng:</strong> 
                      <span className="text-neutral-700 ms-2">
                        {isAcademicStaffMode ? displayScheduleInfo.roomName : displayScheduleInfo.roomName || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Conflict warnings */}
          {conflicts && conflicts.hasConflict && (
            <Alert variant="warning" className="mb-3">
              <Alert.Heading>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Có xung đột lịch học
              </Alert.Heading>
              {conflicts.conflicts?.room?.length > 0 && (
                <div className="mb-2">
                  <strong>Xung đột phòng:</strong>
                  <ul className="mb-0 mt-1">
                    {conflicts.conflicts.room.map((conflict, idx) => (
                      <li key={idx}>
                        {conflict.roomName} - {conflict.date} ({conflict.time})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {conflicts.conflicts?.teacher?.length > 0 && (
                <div className="mb-2">
                  <strong>Xung đột giáo viên:</strong>
                  <ul className="mb-0 mt-1">
                    {conflicts.conflicts.teacher.map((conflict, idx) => (
                      <li key={idx}>
                        Lớp {conflict.className} - {conflict.date} ({conflict.time})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {conflicts.conflicts?.students?.length > 0 && (
                <div className="mb-2">
                  <strong>Xung đột lịch học viên:</strong>
                  <ul className="mb-0 mt-1">
                    {conflicts.conflicts.students.map((conflict, idx) => (
                      <li key={idx}>
                        Lớp {conflict.className} - {conflict.date} ({conflict.time})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}

          {/* Content based on request type */}
          {effectiveRequestType === 'request_replace_teacher' ? (
            // Substitute teacher selection (AcademicStaff only)
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Chọn giáo viên dạy thay <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={selectedSubstituteTeacherId}
                onChange={(e) => {
                  const teacherId = e.target.value;
                  setSelectedSubstituteTeacherId(teacherId);
                }}
                disabled={loadingOriginalSchedule || !originalScheduleInfo}
                required
              >
                <option value="">-- Chọn giáo viên dạy thay --</option>
                {teachers
                  .filter(teacher => {
                    const teacherId = (teacher._id || teacher.id)?.toString();
                    const currentTeacherId = originalScheduleInfo?.teacher?.toString();
                    // Filter out current teacher and conflicted teachers
                    if (teacherId === currentTeacherId) {
                      return false;
                    }
                    if (conflictedSubstituteTeacherIds.has(teacherId)) {
                      return false;
                    }
                    return true;
                  })
                  .map(teacher => (
                    <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                      {teacher.username || teacher.fullName || teacher.name || 'N/A'}
                    </option>
                  ))
                }
              </Form.Select>
              
              {loadingOriginalSchedule && (
                <div className="mt-2 text-muted">
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Đang tải thông tin buổi học...
                </div>
              )}
            </Form.Group>
          ) : (
            // Makeup class options
            <>
              {/* Option selection */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Chọn phương thức:</Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    id="makeup-existing"
                    name="makeupOption"
                    label="Chọn từ buổi học có sẵn"
                    value="existing"
                    checked={makeupOption === 'existing'}
                    onChange={(e) => setMakeupOption(e.target.value)}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    id="makeup-new"
                    name="makeupOption"
                    label="Tạo buổi học bù mới"
                    value="new"
                    checked={makeupOption === 'new'}
                    onChange={(e) => setMakeupOption(e.target.value)}
                  />
                </div>
              </Form.Group>

              {/* Existing schedule selection */}
              {makeupOption === 'existing' ? (
                <div className="mb-3">

                  <Form.Label>
                    Chọn buổi học bù <span className="text-danger">*</span>
                  </Form.Label>
                  {loadingSchedules ? (
                    <div className="text-center py-3">
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Đang tải danh sách buổi học...
                    </div>
                  ) : availableSchedules.length > 0 ? (
                    <>
                      <Form.Select
                        value={selectedExistingScheduleId}
                        onChange={(e) => setSelectedExistingScheduleId(e.target.value)}
                        required
                      >
                        <option value="">-- Chọn buổi học bù --</option>
                        {availableSchedules.map((schedule) => {
                          const scheduleId = (schedule._id || schedule.id)?.toString();
                          const dateStr = isAcademicStaffMode 
                            ? formatDateForDisplay(schedule.date)
                            : schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : '';
                          const timeStr = `${schedule.startTime || ''} - ${schedule.endTime || ''}`;
                          const className = schedule.class?.name || (schedule.class === null || schedule.class === undefined ? 'Lớp học bù' : 'N/A');
                          const sessionTitle = schedule.session?.title || 'N/A';
                          const displayText = `${sessionTitle} - ${className}${dateStr ? ` (${dateStr})` : ''} - ${timeStr}`;
                          return (
                            <option key={scheduleId} value={scheduleId}>
                              {displayText}
                            </option>
                          );
                        })}
                      </Form.Select>
                      
                      {/* Show selected schedule details */}
                      {selectedExistingScheduleId && availableSchedules.length > 0 && (() => {
                        const selectedSchedule = availableSchedules.find(
                          s => (s._id || s.id)?.toString() === selectedExistingScheduleId
                        );
                        
                        if (!selectedSchedule) return null;
                        
                        const scheduleDate = isAcademicStaffMode
                          ? formatDateForDisplay(selectedSchedule.date) || 'N/A'
                          : selectedSchedule.date ? new Date(selectedSchedule.date).toLocaleDateString('vi-VN') : 'N/A';
                        
                        return (
                          <Card className="mt-3 bg-success-25 border border-success-200 rounded-12" style={{ borderLeft: '4px solid #4CAF50' }}>
                            <Card.Header className="bg-success-50 border-0 rounded-top-12 p-16">
                              <h5 className="mb-0 text-neutral-900 fw-semibold">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                Thông tin buổi học bù đã chọn
                              </h5>
                            </Card.Header>
                            <Card.Body className="p-20">
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <div className="text-14">
                                    <strong className="text-neutral-900">Buổi học:</strong> 
                                    <span className="text-neutral-700 ms-2">
                                      {selectedSchedule.session?.title || 'N/A'}
                                      {selectedSchedule.session?.order !== null && selectedSchedule.session?.order !== undefined && (
                                        <span className="text-neutral-500 ms-1">(STT: {selectedSchedule.session.order})</span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="text-14">
                                    <strong className="text-neutral-900">Lớp:</strong> 
                                    <span className="text-neutral-700 ms-2">
                                      {selectedSchedule.class?.name || (selectedSchedule.class === null || selectedSchedule.class === undefined ? 'Lớp học bù' : 'N/A')}
                                    </span>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="text-14">
                                    <strong className="text-neutral-900">Ngày học:</strong> 
                                    <span className="text-neutral-700 ms-2">{scheduleDate}</span>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="text-14">
                                    <strong className="text-neutral-900">Thời gian:</strong> 
                                    <span className="text-neutral-700 ms-2">
                                      {selectedSchedule.startTime || 'N/A'} - {selectedSchedule.endTime || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="text-14">
                                    <strong className="text-neutral-900">Phòng:</strong> 
                                    <span className="text-neutral-700 ms-2">{selectedSchedule.room?.room_name || 'N/A'}</span>
                                  </div>
                                </div>
                                {selectedSchedule.class?.course?.name && (
                                  <div className="col-md-6">
                                    <div className="text-14">
                                      <strong className="text-neutral-900">Khóa học:</strong> 
                                      <span className="text-neutral-700 ms-2">{selectedSchedule.class.course.name}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        );
                      })()}
                    </>
                  ) : (
                    <Alert variant="info">
                      <i className="fas fa-info-circle me-2"></i>
                      Không có buổi học bù phù hợp. Vui lòng tạo buổi học bù mới.
                    </Alert>
                  )}
                </div>
              ) : (
                <>
                  {/* Form fields for new makeup class */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label>
                          Ngày học bù <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label>
                          Giờ bắt đầu <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label>
                          Giờ kết thúc <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </div>
                  </div>

                  {/* Hint message when date/time not selected */}
                  {!isDateTimeSelected && (
                    <Alert variant="info" className="mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Vui lòng chọn ngày và giờ trước khi chọn phòng và giáo viên.
                    </Alert>
                  )}

                  {/* Warning when student has schedule conflict */}
                  {studentScheduleConflict && studentScheduleConflict.hasConflict && (
                    <Alert variant="danger" className="mb-3">
                      <Alert.Heading>
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Xung đột lịch học của học viên!
                      </Alert.Heading>
                      <p className="mb-0">
                        Học viên đã có buổi học <strong>"{studentScheduleConflict.className}"</strong> vào thời gian <strong>{studentScheduleConflict.timeRange}</strong> trong ngày này.
                      </p>
                      <p className="mb-0 mt-2">
                        <strong>Không thể tạo buổi học bù</strong> vì sẽ trùng với lịch học hiện tại của học viên.
                      </p>
                      <p className="mb-0 mt-2 text-muted">
                        Vui lòng chọn thời gian khác hoặc hủy buổi học hiện tại trước.
                      </p>
                    </Alert>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label>
                          Phòng học <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="room"
                          value={formData.room}
                          onChange={handleInputChange}
                          disabled={!isDateTimeSelected}
                          required
                        >
                          <option value="">Chọn phòng học</option>
                          {rooms
                            .filter(room => {
                              const roomId = String(room._id || room.id);
                              return !conflictedRoomIds.has(roomId);
                            })
                            .map(room => {
                              const roomName = room.room_name || room.name;
                              const location = room.location ? `(${room.location})` : '';
                              
                              return (
                                <option 
                                  key={room._id || room.id} 
                                  value={room._id || room.id}
                                >
                                  {roomName} {location}
                                </option>
                              );
                            })}
                        </Form.Select>
                      </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label>
                          Giáo viên <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="teacher"
                          value={formData.teacher}
                          onChange={handleInputChange}
                          disabled={!isDateTimeSelected}
                          required
                        >
                          <option value="">Chọn giáo viên</option>
                          {teachers
                            .filter(teacher => {
                              const teacherId = String(teacher._id || teacher.id);
                              return !conflictedTeacherIds.has(teacherId);
                            })
                            .map(teacher => (
                              <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                                {teacher.username || teacher.fullName || teacher.name || 'N/A'}
                              </option>
                            ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  {validating && (
                    <Alert variant="info" className="mb-0">
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Đang kiểm tra xung đột lịch học...
                    </Alert>
                  )}
                </>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top p-24">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            variant={effectiveRequestType === 'request_replace_teacher' ? 'info' : 'warning'}
            type="submit" 
            disabled={
              loading || 
              validating || 
              (effectiveRequestType === 'request_replace_teacher' && !selectedSubstituteTeacherId) ||
              (effectiveRequestType === 'makeup_class' && makeupOption === 'new' && conflicts && conflicts.hasConflict) ||
              (effectiveRequestType === 'makeup_class' && makeupOption === 'new' && studentScheduleConflict && studentScheduleConflict.hasConflict) ||
              (effectiveRequestType === 'makeup_class' && makeupOption === 'existing' && !selectedExistingScheduleId)
            }
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                {effectiveRequestType === 'request_replace_teacher' 
                  ? 'Xác nhận chọn giáo viên dạy thay'
                  : makeupOption === 'existing' 
                    ? 'Xác nhận chọn buổi học bù' 
                    : 'Tạo buổi học bù'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MakeupClassRequestModal;

