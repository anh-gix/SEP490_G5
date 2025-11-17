import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import scheduleService from '../../services/scheduleService';
import roomService from '../../services/roomService';
import teacherService from '../../services/teacherService';

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
    teacherId: '',
    roomId: '',
    maxStudents: 25,
    startDate: '',
    endDate: '',
    scheduleEntries: [createEmptyScheduleEntry()],
    tuitionFee: 0
  });

  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [teacherSchedules, setTeacherSchedules] = useState({}); // Map teacherId -> schedules
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

  const programs = [
    { id: 1, name: 'Tiếng Anh Giao tiếp', levels: ['A1', 'A2', 'B1', 'B2', 'C1'] },
    { id: 2, name: 'TOEIC', levels: ['TOEIC 450', 'TOEIC 600', 'TOEIC 750+'] },
    { id: 3, name: 'IELTS', levels: ['IELTS 4.0', 'IELTS 5.5', 'IELTS 6.5+'] }
  ];

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate dates when they change (use setTimeout to validate after state update)
    if (name === 'startDate' || name === 'endDate') {
      const today = getTodayDate();
      
      // Get the updated values
      const newStartDate = name === 'startDate' ? value : formData.startDate;
      const newEndDate = name === 'endDate' ? value : formData.endDate;
      
      // Validate start date is not in the past
      if (name === 'startDate' && value && value < today) {
        setDateError('Ngày khai giảng không được là quá khứ!');
      }
      // Validate if both dates are filled
      else if (newStartDate && newEndDate && newEndDate <= newStartDate) {
        setDateError('Ngày kết thúc phải sau ngày khai giảng!');
      }
      else {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.level || !formData.program) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
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

    // Validate date range
    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      alert('Ngày kết thúc phải sau ngày khai giảng!');
      setDateError('Ngày kết thúc phải sau ngày khai giảng!');
      return;
    }

    onSubmit(formData);
  };

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

  const filledScheduleEntries = useMemo(
    () =>
      formData.scheduleEntries.filter(
        (entry) => entry.day && entry.startTime && entry.endTime
      ),
    [formData.scheduleEntries]
  );

  const conflictingRoomIds = useMemo(() => {
    if (!filledScheduleEntries.length || !existingSchedules.length || !formData.startDate || !formData.endDate) {
      return new Set();
    }

    const conflicts = new Set();

    filledScheduleEntries.forEach((entry) => {
      const entryDay = normalizeDayValue(entry.day);
      const entryStart = parseTime(entry.startTime);
      const entryEnd = parseTime(entry.endTime);

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

        // Try to get day from various possible fields
        let scheduleDayRaw = 
          schedule.day ||
          schedule.dayOfWeek ||
          schedule.day_of_week ||
          schedule.weekDay ||
          schedule.date ||
          schedule.scheduleDate ||
          schedule.classDate;
        
        // If we have a date, try to parse it to day of week
        if (!scheduleDayRaw && (schedule.date || schedule.scheduleDate || schedule.classDate)) {
          scheduleDayRaw = schedule.date || schedule.scheduleDate || schedule.classDate;
        }
        
        const scheduleDay = normalizeDayValue(scheduleDayRaw);

        if (!scheduleDay || scheduleDay !== entryDay) {
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

        const hasTimeConflict = hasTimeOverlap(entryStart, entryEnd, scheduleStart, scheduleEnd);

        // Kiểm tra date range overlap với class (API populate class với startDate và endDate)
        const scheduleStartDate = 
          schedule.class?.startDate ||
          schedule.classStartDate ||
          schedule.startDate ||
          schedule.start_date;
        const scheduleEndDate = 
          schedule.class?.endDate ||
          schedule.classEndDate ||
          schedule.endDate ||
          schedule.end_date;

        const hasDateConflict = hasDateRangeOverlap(
          formData.startDate,
          formData.endDate,
          scheduleStartDate,
          scheduleEndDate
        );

        // Chỉ coi là conflict nếu có cả time overlap VÀ date range overlap
        if (hasTimeConflict && hasDateConflict) {
          // Lấy ngày cụ thể của schedule (nếu có)
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
          const scheduleDateStr = scheduleDate 
            ? new Date(scheduleDate).toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              })
            : 'N/A';
          
          // Format ngày tháng cho dễ đọc
          const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            try {
              const date = new Date(dateStr);
              return date.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              });
            } catch {
              return dateStr;
            }
          };

          console.log('🔴 CONFLICT Room:', {
            room: scheduleRoomName || `Room ID: ${scheduleRoomId}`,
            conflictDetails: {
              'Bạn chọn': {
                'Ngày trong tuần': entryDay === '2' ? 'Thứ 2' : entryDay === '3' ? 'Thứ 3' : entryDay === '4' ? 'Thứ 4' : entryDay === '5' ? 'Thứ 5' : entryDay === '6' ? 'Thứ 6' : entryDay === '7' ? 'Thứ 7' : entryDay === 'CN' ? 'Chủ nhật' : entryDay,
                'Giờ học': `${entryStart} - ${entryEnd}`,
                'Khoảng thời gian lớp học': `${formatDate(formData.startDate)} đến ${formatDate(formData.endDate)}`
              },
              'Phòng đã bị đặt': {
                'Ngày cụ thể': scheduleDateStr,
                'Ngày trong tuần': scheduleDay === '2' ? 'Thứ 2' : scheduleDay === '3' ? 'Thứ 3' : scheduleDay === '4' ? 'Thứ 4' : scheduleDay === '5' ? 'Thứ 5' : scheduleDay === '6' ? 'Thứ 6' : scheduleDay === '7' ? 'Thứ 7' : scheduleDay === 'CN' ? 'Chủ nhật' : scheduleDay,
                'Giờ học': `${scheduleStart} - ${scheduleEnd}`,
                'Khoảng thời gian lớp học': `${formatDate(scheduleStartDate)} đến ${formatDate(scheduleEndDate)}`,
                'Lớp học': schedule.class?.name || 'N/A'
              },
              'Lý do conflict': 'Trùng ngày trong tuần, trùng giờ học, và khoảng thời gian lớp học có overlap'
            },
            technical: {
              scheduleId: schedule._id || schedule.id,
              scheduleRoomId,
              scheduleRoomName,
              hasTimeConflict,
              hasDateConflict
            }
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
  }, [filledScheduleEntries, existingSchedules, formData.startDate, formData.endDate]);

  // Fetch teacher schedules when date range is available
  useEffect(() => {
    const fetchTeacherSchedules = async () => {
      if (!formData.startDate || !formData.endDate || teachers.length === 0) {
        return;
      }

      const schedulesMap = {};
      
      // Fetch schedules for each teacher
      await Promise.all(
        teachers.map(async (teacher) => {
          const teacherId = teacher._id || teacher.id;
          if (!teacherId) return;

          try {
            const response = await teacherService.getTeacherSchedule(teacherId, {
              startDate: formData.startDate,
              endDate: formData.endDate
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
  }, [teachers, formData.startDate, formData.endDate]);

  const conflictingTeacherIds = useMemo(() => {
    if (!filledScheduleEntries.length || !formData.startDate || !formData.endDate) {
      return new Set();
    }

    const conflicts = new Set();

    // Check each teacher's schedules
    Object.entries(teacherSchedules).forEach(([teacherId, schedules]) => {
      if (!schedules || schedules.length === 0) return;

      filledScheduleEntries.forEach((entry) => {
        const entryDay = normalizeDayValue(entry.day);
        const entryStart = parseTime(entry.startTime);
        const entryEnd = parseTime(entry.endTime);

        schedules.forEach((schedule) => {
          // Get day of week from schedule date
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate;
          const scheduleDay = scheduleDate ? parseDateToDayOfWeek(scheduleDate) : null;

          // Check if same day of week
          if (!scheduleDay || scheduleDay !== entryDay) {
            return;
          }

          // Check time overlap
          const scheduleStart = parseTime(schedule.startTime);
          const scheduleEnd = parseTime(schedule.endTime);
          const hasTimeConflict = hasTimeOverlap(entryStart, entryEnd, scheduleStart, scheduleEnd);

          if (!hasTimeConflict) {
            return;
          }

          // Check date range overlap with class (not just schedule date)
          const scheduleClassStartDate = 
            schedule.classStartDate ||
            schedule.class?.startDate ||
            schedule.startDate;
          const scheduleClassEndDate = 
            schedule.classEndDate ||
            schedule.class?.endDate ||
            schedule.endDate;

          // Kiểm tra overlap giữa khoảng thời gian lớp học mới và lớp học cũ của giáo viên
          const hasDateConflict = hasDateRangeOverlap(
            formData.startDate,
            formData.endDate,
            scheduleClassStartDate,
            scheduleClassEndDate
          );

          if (hasDateConflict) {
            console.log('🔴 CONFLICT Teacher:', {
              teacherId,
              scheduleId: schedule._id || schedule.id,
              entryDay,
              scheduleDay,
              entryTime: `${entryStart}-${entryEnd}`,
              scheduleTime: `${scheduleStart}-${scheduleEnd}`,
              newClassDateRange: `${formData.startDate} - ${formData.endDate}`,
              existingClassDateRange: `${scheduleClassStartDate} - ${scheduleClassEndDate}`,
              scheduleDate: scheduleDate
            });
            conflicts.add(teacherId);
          }
        });
      });
    });

    console.log('📋 Conflicting Teacher IDs:', Array.from(conflicts));
    return conflicts;
  }, [filledScheduleEntries, teacherSchedules, formData.startDate, formData.endDate]);

  const filteredRooms = useMemo(() => {
    if (!filledScheduleEntries.length || !existingSchedules.length || !formData.startDate || !formData.endDate) {
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
  }, [filledScheduleEntries, existingSchedules, rooms, conflictingRoomIds, formData.startDate, formData.endDate]);

  const filteredTeachers = useMemo(() => {
    // Nếu chưa có đủ thông tin để filter (chưa chọn schedule hoặc date), hiển thị tất cả teachers
    if (!filledScheduleEntries.length || !existingSchedules.length || !formData.startDate || !formData.endDate) {
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
  }, [filledScheduleEntries, existingSchedules, teachers, conflictingTeacherIds, formData.startDate, formData.endDate]);

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
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">
                    Ngày kết thúc
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || getTodayDate()}
                    className={`border-neutral-30 radius-8 px-16 py-10 ${dateError ? 'border-danger' : ''}`}
                  />
                  {dateError && dateError.includes('kết thúc') && (
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
                    ) : filteredTeachers.length === 0 && (filledScheduleEntries.length > 0 && formData.startDate && formData.endDate) ? (
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
                      : filteredTeachers.length === 0 && (filledScheduleEntries.length > 0 && formData.startDate && formData.endDate)
                      ? 'Không còn giáo viên phù hợp (tất cả đều bị trùng lịch)'
                      : filledScheduleEntries.length > 0 && formData.startDate && formData.endDate
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
                    {programs.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
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
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
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
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-neutral-700 fw-medium mb-8">Học phí (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    name="tuitionFee"
                    value={formData.tuitionFee}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="border-neutral-30 radius-8 px-16 py-10"
                  />
                </Form.Group>
              </div>
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
    </Modal>
  );
};

export default CreateClassModal;
