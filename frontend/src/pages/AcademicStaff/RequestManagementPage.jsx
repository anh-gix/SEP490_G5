import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Pagination, Button, Modal, Form, Row, Col, InputGroup, Accordion } from 'react-bootstrap';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import ScheduleCalendar from '../../components/class_management/ScheduleCalendar';
import changeRequestService from '../../services/changeRequestService';
import academicStaffService from '../../services/academicStaffService';
import classService from '../../services/classService';
import { classScheduleService } from '../../services/classScheduleService';
import teacherService from '../../services/teacherService';
import roomService from '../../services/roomService';
import { formatDateToYYYYMMDD } from '../../helper/helper';
import RequestDetailPage from './RequestDetailPage';

/**
 * Request Management Page for Academic Staff
 * Quản lý đơn xin đổi buổi/lớp học
 */
const RequestManagementPage = () => {
  const [changeRequests, setChangeRequests] = useState([]);
  const [allChangeRequests, setAllChangeRequests] = useState([]); // Store all fetched requests for sorting
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('oldest'); // 'oldest', 'newest', 'sender', 'sender-desc'
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [senderSchedule, setSenderSchedule] = useState([]);
  const [senderRole, setSenderRole] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [showChangeClassModal, setShowChangeClassModal] = useState(false);
  const [selectedClassToChange, setSelectedClassToChange] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loadingAvailableClasses, setLoadingAvailableClasses] = useState(false);
  const [selectedNewClassId, setSelectedNewClassId] = useState(null);
  const [selectedNewClassInfo, setSelectedNewClassInfo] = useState(null);
  const [loadingNewClassInfo, setLoadingNewClassInfo] = useState(false);
  const [pendingClassChange, setPendingClassChange] = useState(null); // Lưu tạm thông tin đổi lớp
  const [pendingMakeupClasses, setPendingMakeupClasses] = useState([]); // Lưu danh sách buổi học bù pending
  const [pendingMakeupSessions, setPendingMakeupSessions] = useState([]); // Lưu danh sách sessions cần học bù (trường hợp 2)
  const [showMakeupClassModal, setShowMakeupClassModal] = useState(false); // Modal thêm buổi học bù
  const [makeupClassOption, setMakeupClassOption] = useState(null); // Chỉ 'existing' (chọn buổi có sẵn)
  const [selectedMakeupClassId, setSelectedMakeupClassId] = useState(null); // Lớp được chọn cho buổi học bù
  const [selectedMakeupClassInfo, setSelectedMakeupClassInfo] = useState(null); // Thông tin lớp được chọn
  const [availableMakeupClasses, setAvailableMakeupClasses] = useState([]); // Danh sách lớp có sẵn
  const [availableMakeupClassesWithSchedules, setAvailableMakeupClassesWithSchedules] = useState([]); // Danh sách lớp kèm schedules
  const [availableClassSchedulesBySession, setAvailableClassSchedulesBySession] = useState([]); // Danh sách ClassSchedule có cùng session và sau hôm nay
  const [loadingClassSchedulesBySession, setLoadingClassSchedulesBySession] = useState(false);
  const [loadingMakeupClasses, setLoadingMakeupClasses] = useState(false);
  const [loadingMakeupClassInfo, setLoadingMakeupClassInfo] = useState(false);
  const [selectedCurrentClassId, setSelectedCurrentClassId] = useState(null); // Lớp được chọn cho buổi được đổi (bên trái)
  const [selectedCurrentClassInfo, setSelectedCurrentClassInfo] = useState(null); // Thông tin lớp được chọn (bên trái)
  const [selectedCurrentScheduleId, setSelectedCurrentScheduleId] = useState(null); // Buổi học được chọn từ lớp hiện tại
  const [loadingCurrentClassInfo, setLoadingCurrentClassInfo] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null); // Lưu thông tin conflict để hiển thị trong modal
  const [pendingMakeupData, setPendingMakeupData] = useState(null); // Lưu dữ liệu makeup đang chờ xác nhận khi có conflict
  const [validatingConflict, setValidatingConflict] = useState(false); // Trạng thái đang validate conflict
  const [newClassSchedule, setNewClassSchedule] = useState([]); // Lưu lịch học của lớp mới khi có đổi lớp
  // State cho tạo lớp mới - ĐÃ XÓA (không cho phép tạo lớp mới, chỉ chọn buổi có sẵn)
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  // State cho giáo viên dạy thay (chỉ dùng khi senderRole === 'Teacher')
  const [selectedSubstituteTeacherId, setSelectedSubstituteTeacherId] = useState(null);
  const [availableSubstituteTeachers, setAvailableSubstituteTeachers] = useState([]);
  const [loadingSubstituteTeachers, setLoadingSubstituteTeachers] = useState(false);
  const [showAbsentScheduleList, setShowAbsentScheduleList] = useState(true); // State để ẩn/hiện danh sách buổi nghỉ

  useEffect(() => {
    fetchChangeRequests();
  }, [page, searchTerm, filterStatus, filterType]);

  // Tự động validate conflict khi chọn buổi học bù (chỉ cho học sinh)
  useEffect(() => {
    const validateConflict = async () => {
      // Chỉ validate khi:
      // 1. Modal đang mở
      // 2. senderRole !== 'Teacher' (chỉ validate cho học sinh)
      // 3. Đã chọn buổi học bù
      // 4. Có thông tin request và sender
      if (!showMakeupClassModal || 
          senderRole === 'Teacher' ||
          !selectedMakeupClassInfo?.selectedScheduleId || 
          !selectedRequest || 
          !selectedRequest.sender) {
        setConflictInfo(null);
        setPendingMakeupData(null);
        return;
      }

      try {
        setValidatingConflict(true);
        const studentId = selectedRequest.sender._id || selectedRequest.sender;
        const makeupClassScheduleId = selectedMakeupClassInfo.selectedScheduleId;

        const validateResponse = await classScheduleService.validateMakeupClassSchedule(
          makeupClassScheduleId,
          studentId
        );

        if (validateResponse.success) {
          if (validateResponse.hasConflict && validateResponse.conflicts && validateResponse.conflicts.length > 0) {
            // Format conflict info để hiển thị
            const conflictInfo = {
              students: [{
                studentName: selectedRequest.sender?.username || 'Học sinh',
                conflicts: validateResponse.conflicts
              }]
            };
            
            // Lấy thông tin buổi học bù để hiển thị
            // Tìm trong fixedSchedules trước, nếu không có thì tìm trong availableClassSchedulesBySession
            let makeupSchedule = selectedMakeupClassInfo.fixedSchedules?.find(
              s => (s.id || s._id)?.toString() === selectedMakeupClassInfo.selectedScheduleId?.toString()
            );
            
            // Nếu không tìm thấy trong fixedSchedules, tìm trong availableClassSchedulesBySession
            if (!makeupSchedule && availableClassSchedulesBySession && availableClassSchedulesBySession.length > 0) {
              const scheduleFromAPI = availableClassSchedulesBySession.find(
                s => (s._id || s.id)?.toString() === selectedMakeupClassInfo.selectedScheduleId?.toString()
              );
              if (scheduleFromAPI) {
                makeupSchedule = {
                  id: scheduleFromAPI._id || scheduleFromAPI.id,
                  _id: scheduleFromAPI._id || scheduleFromAPI.id,
                  title: scheduleFromAPI.session?.title || 'N/A',
                  order: scheduleFromAPI.session?.order || null,
                  date: scheduleFromAPI.date,
                  startTime: scheduleFromAPI.startTime,
                  endTime: scheduleFromAPI.endTime,
                  roomName: scheduleFromAPI.room?.room_name || 'N/A'
                };
              }
            }
            
            setConflictInfo(conflictInfo);
            setPendingMakeupData({
              absentSchedule: null, // Chưa cần ở đây
              makeupSchedule: makeupSchedule
            });
          } else {
            // Không có conflict
            setConflictInfo(null);
            setPendingMakeupData(null);
          }
        } else {
          // Lỗi validate, xóa conflict info
          setConflictInfo(null);
          setPendingMakeupData(null);
        }
      } catch (err) {
        console.error('Error validating conflict:', err);
        // Không hiển thị lỗi, chỉ xóa conflict info
        setConflictInfo(null);
        setPendingMakeupData(null);
      } finally {
        setValidatingConflict(false);
      }
    };

    // Debounce để tránh gọi quá nhiều lần
    const timeoutId = setTimeout(() => {
      validateConflict();
    }, 300); // Đợi 300ms sau khi người dùng ngừng chọn

    return () => clearTimeout(timeoutId);
  }, [showMakeupClassModal, senderRole, selectedMakeupClassInfo?.selectedScheduleId, selectedRequest, availableClassSchedulesBySession]);

  // Tự động tính toán pendingMakeupSessions khi có pendingClassChange
  useEffect(() => {
    // Chỉ tính toán cho đơn change_class
    if (!selectedRequest || selectedRequest.type !== 'change_class') {
      setPendingMakeupSessions([]);
      return;
    }
    
    // Chỉ tính toán khi có pendingClassChange
    if (!pendingClassChange) {
      setPendingMakeupSessions([]);
      return;
    }
    
    // Lấy thông tin session order từ oldClassInfo và newClassInfo
    const oldClassInfo = pendingClassChange.oldClassInfo;
    const newClassInfo = pendingClassChange.newClassInfo;
    const oldSessionOrder = oldClassInfo?.currentSessionOrder;
    const newSessionOrder = newClassInfo?.currentSessionOrder;
    const makeupSessions = [];
    
    // Log thông tin lớp đang học và lớp muốn đổi
    console.log('========================================');
    console.log('Lớp đang học:');
    console.log('  - Tên lớp:', oldClassInfo?.className || 'N/A');
    console.log('  - Khóa học:', oldClassInfo?.courseName || 'N/A');
    console.log('  - Session hiện tại:', oldClassInfo?.currentSessionTitle || 'N/A');
    console.log('  - Số thứ tự session:', oldSessionOrder);
    console.log('  - Class ID:', pendingClassChange.oldClassId);
    console.log('');
    console.log('Lớp muốn đổi:');
    console.log('  - Tên lớp:', newClassInfo?.className || 'N/A');
    console.log('  - Khóa học:', newClassInfo?.courseName || 'N/A');
    console.log('  - Session hiện tại:', newClassInfo?.currentSessionTitle || 'N/A');
    console.log('  - Số thứ tự session:', newSessionOrder);
    console.log('  - Class ID:', pendingClassChange.newClassId);
    console.log('========================================');
    
    // Chỉ tính toán khi lớp mới học nhanh hơn lớp cũ (newSessionOrder > oldSessionOrder)
    if (oldSessionOrder !== null && newSessionOrder !== null && newSessionOrder > oldSessionOrder) {
      // Tìm các sessions chưa học của lớp cũ có session order < newSessionOrder
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const oldClassId = pendingClassChange.oldClassId?.toString();
      
      // Tìm trong senderSchedule trước (có thông tin attendance)
      let oldClassSchedules = [];
      if (senderSchedule && senderSchedule.length > 0) {
        oldClassSchedules = senderSchedule.filter(sch => {
          const classId = sch.class?._id?.toString() || sch.class?.toString();
          return classId === oldClassId;
        });
      }
      
      // Nếu không tìm thấy trong senderSchedule, lấy từ fixedSchedules của lớp cũ (từ request data)
      if (oldClassSchedules.length === 0 && oldClassInfo?.fixedSchedules && oldClassInfo.fixedSchedules.length > 0) {
        // Lấy từ fixedSchedules và tìm studentSchedule tương ứng từ senderSchedule
        const fixedSchedules = oldClassInfo.fixedSchedules.filter(sch => sch.status === 'fixed' || !sch.status);
        
        fixedSchedules.forEach(fixedSch => {
          const fixedClassScheduleId = fixedSch._id || fixedSch.id || null;
          
          // Tìm studentSchedule từ senderSchedule - thử nhiều cách
          let matchingStudentSchedule = null;
          
          // Cách 1: Tìm theo classScheduleId (nếu có)
          if (fixedClassScheduleId) {
            matchingStudentSchedule = senderSchedule.find(sch => {
              const classScheduleId = sch.classSchedule?._id?.toString() || sch.classSchedule?.id?.toString();
              return classScheduleId === fixedClassScheduleId.toString();
            });
          }
          
          // Cách 2: Tìm theo ngày, giờ, và lớp (nếu cách 1 không tìm thấy)
          if (!matchingStudentSchedule) {
            matchingStudentSchedule = senderSchedule.find(sch => {
              const schDate = new Date(sch.date);
              const fixedDate = new Date(fixedSch.date);
              schDate.setHours(0, 0, 0, 0);
              fixedDate.setHours(0, 0, 0, 0);
              
              const classId = sch.class?._id?.toString() || sch.class?.toString();
              return classId === oldClassId &&
                     schDate.getTime() === fixedDate.getTime() &&
                     sch.startTime === fixedSch.startTime &&
                     sch.endTime === fixedSch.endTime;
            });
          }
          
          if (matchingStudentSchedule) {
            oldClassSchedules.push({
              _id: matchingStudentSchedule._id,
              id: matchingStudentSchedule.id,
              date: matchingStudentSchedule.date,
              startTime: matchingStudentSchedule.startTime,
              endTime: matchingStudentSchedule.endTime,
              session: matchingStudentSchedule.session,
              attendance: matchingStudentSchedule.attendance,
              classSchedule: matchingStudentSchedule.classSchedule
            });
          } else {
            // Nếu không tìm thấy studentSchedule, vẫn thêm vào và lưu classScheduleId để tìm sau
            oldClassSchedules.push({
              date: fixedSch.date,
              startTime: fixedSch.startTime,
              endTime: fixedSch.endTime,
              session: fixedSch.session || { order: fixedSch.order, title: fixedSch.title },
              attendance: null,
              classScheduleId: fixedClassScheduleId,
              classId: oldClassId // Lưu thêm classId để tìm sau
            });
          }
        });
      }
      
      console.log(`Tìm thấy ${oldClassSchedules.length} buổi học của lớp cũ`);
      
      // Debug: Log thông tin về việc tìm studentSchedule
      const schedulesWithStudentScheduleId = oldClassSchedules.filter(s => s._id || s.id);
      const schedulesWithoutStudentScheduleId = oldClassSchedules.filter(s => !s._id && !s.id);
      if (schedulesWithoutStudentScheduleId.length > 0) {
        console.log(`⚠️ Có ${schedulesWithoutStudentScheduleId.length} buổi không tìm thấy studentScheduleId từ senderSchedule`);
        schedulesWithoutStudentScheduleId.forEach(s => {
          console.log('  - Buổi:', {
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
            classScheduleId: s.classScheduleId,
            classId: s.classId
          });
        });
      }
      
      oldClassSchedules.forEach(schedule => {
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        const sessionOrder = schedule.session?.order;
        const attendanceStatus = schedule.attendance?.status;
        
        // Kiểm tra session chưa học và có order < newSessionOrder
        const isFutureDate = scheduleDate > today;
        const hasNoAttendance = attendanceStatus === null || attendanceStatus === undefined;
        const isFutureOrNoAttendance = isFutureDate || hasNoAttendance;
        const needsMakeup = sessionOrder !== null && sessionOrder !== undefined && 
            sessionOrder < newSessionOrder &&
            isFutureOrNoAttendance;
        
        // Debug log cho từng buổi
        if (sessionOrder !== null && sessionOrder !== undefined) {
          console.log(`📅 Buổi ${sessionOrder}:`, {
            date: schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : 'N/A',
            sessionOrder: sessionOrder,
            newSessionOrder: newSessionOrder,
            isFutureDate: isFutureDate,
            hasNoAttendance: hasNoAttendance,
            attendanceStatus: attendanceStatus,
            isFutureOrNoAttendance: isFutureOrNoAttendance,
            needsMakeup: needsMakeup,
            reason: !needsMakeup ? (
              sessionOrder >= newSessionOrder ? 'Session order >= newSessionOrder' :
              !isFutureOrNoAttendance ? 'Đã học và đã có điểm danh' :
              'Không xác định'
            ) : 'Cần học bù'
          });
        }
        
        if (needsMakeup) {
          // Ưu tiên dùng _id hoặc id từ schedule (studentScheduleId)
          // Nếu không có, dùng classScheduleId
          const studentScheduleId = schedule._id || schedule.id;
          const classScheduleId = schedule.classSchedule?._id || schedule.classSchedule?.id || schedule.classScheduleId;
          
          // Debug log
          if (!studentScheduleId) {
            console.log(`⚠️ Buổi ${sessionOrder} không có studentScheduleId, sẽ tìm sau từ classScheduleId:`, classScheduleId);
          }
          
          makeupSessions.push({
            sessionOrder: sessionOrder,
            sessionTitle: schedule.session?.title || `Session ${sessionOrder}`,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            studentScheduleId: studentScheduleId || null, // Lưu studentScheduleId riêng
            classScheduleId: classScheduleId || null
          });
        }
      });
      
      // Sắp xếp theo session order
      makeupSessions.sort((a, b) => a.sessionOrder - b.sessionOrder);
      
      // Log các session cần học bù
      console.log('========================================');
      console.log('Các session cần học bù:');
      if (makeupSessions.length === 0) {
        console.log('  (Không có session nào cần học bù)');
      } else {
        makeupSessions.forEach((session, index) => {
          const dateStr = session.date ? new Date(session.date).toLocaleDateString('vi-VN') : 'N/A';
          console.log(`  ${index + 1}. Buổi ${session.sessionOrder}: ${session.sessionTitle}`);
          console.log(`     Ngày: ${dateStr} ${session.startTime}-${session.endTime}`);
        });
      }
      console.log(`Tổng số: ${makeupSessions.length} buổi`);
      console.log('========================================');
    } else {
      console.log('========================================');
      console.log('Không cần học bù vì:');
      if (oldSessionOrder === null || newSessionOrder === null) {
        console.log('  - Thiếu thông tin session order (old:', oldSessionOrder, ', new:', newSessionOrder, ')');
      } else if (newSessionOrder <= oldSessionOrder) {
        console.log('  - Lớp mới không học nhanh hơn lớp cũ (new:', newSessionOrder, '<= old:', oldSessionOrder, ')');
      }
      console.log('========================================');
    }
    
    // Cập nhật pendingMakeupSessions
    setPendingMakeupSessions(makeupSessions);
  }, [selectedRequest, pendingClassChange, senderSchedule]);

  // useEffect để lấy danh sách ClassSchedule có cùng session và debug logs
  useEffect(() => {
    // Chỉ chạy khi có selectedCurrentScheduleId và selectedRequest
    if (!selectedCurrentScheduleId || !selectedRequest) {
      console.log('⚠️ useEffect không chạy vì thiếu selectedCurrentScheduleId hoặc selectedRequest');
      return;
    }

    // Tìm studentSchedule từ senderSchedule dựa trên selectedCurrentScheduleId
    let studentSchedule = null;
    const targetId = selectedCurrentScheduleId.toString();
    
    console.log('🔍 Tìm studentSchedule với selectedCurrentScheduleId:', targetId);
    console.log('📋 senderSchedule length:', senderSchedule?.length || 0);
    
    // Cách 1: Tìm từ senderSchedule (cho đơn change_class)
    if (senderSchedule && senderSchedule.length > 0) {
      studentSchedule = senderSchedule.find(sch => {
        const scheduleId = (sch._id || sch.id)?.toString();
        return scheduleId === targetId;
      });
      
      if (studentSchedule) {
        console.log('✅ Tìm thấy studentSchedule từ senderSchedule');
      } else {
        console.log('⚠️ Không tìm thấy studentSchedule từ senderSchedule');
      }
    }
    
    // Cách 2: Lấy từ selectedRequest.studentScheduleId (cho đơn makeup_class - fallback)
    if (!studentSchedule && selectedRequest.studentScheduleId) {
      const requestStudentSchedule = selectedRequest.studentScheduleId;
      const requestStudentScheduleId = (requestStudentSchedule._id || requestStudentSchedule.id)?.toString();
      if (requestStudentScheduleId === targetId) {
        studentSchedule = requestStudentSchedule;
        console.log('✅ Tìm thấy studentSchedule từ selectedRequest.studentScheduleId');
      }
    }
    
    // Nếu không tìm thấy studentSchedule, không làm gì
    if (!studentSchedule) {
      console.log('❌ Không tìm thấy studentSchedule');
      return;
    }
    
    console.log('✅ Tìm thấy studentSchedule:', {
      studentScheduleId: studentSchedule._id || studentSchedule.id,
      hasClassSchedule: !!studentSchedule.classSchedule,
      classSchedule: studentSchedule.classSchedule
    });
    
    // Thử lấy session từ nhiều nguồn
    let session = null;
    let classSchedule = null;
    
    // Cách 1: Từ classSchedule trong studentSchedule
    if (studentSchedule.classSchedule) {
      classSchedule = studentSchedule.classSchedule;
      session = classSchedule.session;
    }
    
    // Cách 2: Từ session trực tiếp trong studentSchedule (nếu có)
    if (!session && studentSchedule.session) {
      session = studentSchedule.session;
      console.log('⚠️ Tìm thấy session trực tiếp trong studentSchedule (không có classSchedule)');
    }
    
    // Log thông tin session nếu tìm thấy
    if (session) {
      const sessionOrder = session.order;
      const sessionId = session._id || session.id;
      
      console.log('📚 Thông tin session của buổi được chọn:');
      console.log('  - Session ID:', sessionId);
      console.log('  - Session Order:', sessionOrder);
      console.log('  - Session Title:', session.title || 'N/A');
      if (classSchedule) {
        console.log('  - ClassSchedule ID:', classSchedule._id || classSchedule.id);
        console.log('  - ClassSchedule Date:', classSchedule.date);
      }
    } else {
      console.log('❌ Không tìm thấy session từ bất kỳ nguồn nào');
      console.log('📋 Cấu trúc studentSchedule:', JSON.stringify({
        _id: studentSchedule._id,
        id: studentSchedule.id,
        date: studentSchedule.date,
        startTime: studentSchedule.startTime,
        endTime: studentSchedule.endTime,
        hasClassSchedule: !!studentSchedule.classSchedule,
        hasSession: !!studentSchedule.session,
        classSchedule: studentSchedule.classSchedule,
        session: studentSchedule.session
      }, null, 2));
      return;
    }
    
    // Lấy session order và session ID để gọi API
    const sessionOrder = session.order;
    const sessionId = session._id || session.id;
    
    if (!sessionId) {
      console.log('❌ Không có session ID, không thể load danh sách ClassSchedule');
      return;
    }
    
    // List ra tất cả các classSchedule sau hôm nay có cùng session (không thể về quá khứ học)
    (async () => {
      try {
        setLoadingClassSchedulesBySession(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log('🔄 Bắt đầu gọi API để lấy danh sách ClassSchedule:');
        console.log('  - Session ID:', sessionId);
        console.log('  - Session Order:', sessionOrder);
        console.log('  - Date After:', today.toISOString());
        
        // Gọi API để lấy danh sách ClassSchedule
        const apiPort = import.meta.env.VITE_API_PORT || 8080;
        const response = await fetch(`http://localhost:${apiPort}/api/class-schedules/by-session?sessionId=${sessionId}&sessionOrder=${sessionOrder}&dateAfter=${today.toISOString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Danh sách ClassSchedules sau hôm nay có cùng session:', data.classSchedules?.length || 0, 'buổi');
          if (data.classSchedules && data.classSchedules.length > 0) {
            console.log('📋 Chi tiết các buổi học bù:');
            data.classSchedules.forEach((cs, idx) => {
              console.log(`  ${idx + 1}. ${cs.class?.name || 'N/A'} - ${new Date(cs.date).toLocaleDateString('vi-VN')} ${cs.startTime}-${cs.endTime}`);
            });
          }
          
          // Lưu vào state để hiển thị trong UI
          if (data.classSchedules && Array.isArray(data.classSchedules)) {
            setAvailableClassSchedulesBySession(data.classSchedules);
          } else {
            setAvailableClassSchedulesBySession([]);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Lỗi API:', response.status, errorData);
          setAvailableClassSchedulesBySession([]);
        }
      } catch (error) {
        console.error('6. Lỗi khi lấy danh sách ClassSchedule:', error);
        setAvailableClassSchedulesBySession([]);
      } finally {
        setLoadingClassSchedulesBySession(false);
      }
    })();
  }, [selectedCurrentScheduleId, selectedRequest, senderSchedule]);


  // Helper function để so sánh tên với số một cách thông minh (natural sort)
  const naturalCompare = (nameA, nameB) => {
    const a = nameA.toLowerCase();
    const b = nameB.toLowerCase();
    
    // Tách phần text và số
    const regex = /(\d+)/g;
    const partsA = a.split(regex);
    const partsB = b.split(regex);
    
    const minLength = Math.min(partsA.length, partsB.length);
    
    for (let i = 0; i < minLength; i++) {
      const partA = partsA[i];
      const partB = partsB[i];
      
      // Nếu cả hai đều là số, so sánh như số
      if (/^\d+$/.test(partA) && /^\d+$/.test(partB)) {
        const numA = parseInt(partA, 10);
        const numB = parseInt(partB, 10);
        if (numA !== numB) {
          return numA - numB;
        }
      } else {
        // So sánh như string
        const compare = partA.localeCompare(partB, 'vi');
        if (compare !== 0) {
          return compare;
        }
      }
    }
    
    // Nếu các phần đầu giống nhau, phần nào dài hơn thì lớn hơn
    return partsA.length - partsB.length;
  };

  // Sort requests when sortBy changes
  const sortedRequests = useMemo(() => {
    if (!allChangeRequests || allChangeRequests.length === 0) return [];
    
    let sorted = [...allChangeRequests];
    
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'sender') {
      sorted.sort((a, b) => {
        const nameA = a.sender?.username || a.sender?.fullName || a.sender?.name || '';
        const nameB = b.sender?.username || b.sender?.fullName || b.sender?.name || '';
        return naturalCompare(nameA, nameB);
      });
    } else if (sortBy === 'sender-desc') {
      sorted.sort((a, b) => {
        const nameA = a.sender?.username || a.sender?.fullName || a.sender?.name || '';
        const nameB = b.sender?.username || b.sender?.fullName || b.sender?.name || '';
        return naturalCompare(nameB, nameA);
      });
    }
    
    return sorted;
  }, [allChangeRequests, sortBy]);

  // Paginate sorted requests
  useEffect(() => {
    if (sortedRequests.length > 0) {
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedRequests = sortedRequests.slice(startIndex, endIndex);
      setChangeRequests(paginatedRequests);
      setTotalPages(Math.ceil(sortedRequests.length / 10));
    }
  }, [sortedRequests, page]);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 10000 }; // Fetch all for client-side sorting and pagination
      if (searchTerm) params.search = searchTerm;
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      if (filterType && filterType !== 'all') params.type = filterType;
      
      const response = await changeRequestService.getAllChangeRequests(params);
      if (response.success) {
        const requests = response.changeRequests || [];
        setAllChangeRequests(requests);
        setTotal(requests.length);
        
        // Calculate stats
        setStats({
          pending: requests.filter(r => r.status === 'pending').length,
          approved: requests.filter(r => r.status === 'approved').length,
          rejected: requests.filter(r => r.status === 'rejected').length
        });
      } else {
        setError(response.message || 'Không thể tải danh sách đơn');
      }
    } catch (err) {
      console.error('Error fetching change requests:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách đơn');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Chờ duyệt' },
      approved: { variant: 'success', text: 'Đã duyệt' },
      rejected: { variant: 'danger', text: 'Từ chối' }
    };
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      create_class: { variant: 'info', text: 'Tạo lớp' },
      change_class: { variant: 'primary', text: 'Đổi lớp' },
      makeup_class: { variant: 'warning', text: 'Học bù' },
      replace_teacher: { variant: 'secondary', text: 'Thay giáo viên' }
    };
    const config = typeConfig[type] || { variant: 'secondary', text: type || 'N/A' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Transform schedule data for calendar view
  const calendarSchedules = useMemo(() => {
    const schedules = senderSchedule.map((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = formatDateToYYYYMMDD(scheduleDate);
      
      // Lấy attendance status nếu có
      const attendanceStatus = schedule.attendance?.status || null;
      
      // Lấy scheduleStatus từ StudentSchedule (cancelled, scheduled, etc.)
      const scheduleStatus = schedule.scheduleStatus || 'scheduled';
      
      // Kiểm tra xem buổi này có phải là buổi nghỉ không
      const scheduleId = schedule._id || schedule.id || index;
      const isAbsentSchedule = pendingMakeupClasses.some(makeup => {
        // Bỏ qua nếu là giáo viên dạy thay (buổi học vẫn diễn ra, chỉ đổi giáo viên)
        if (makeup.isSubstituteClass) return false;
        const absentId = makeup.absentScheduleId || makeup.absentSchedule?.id || makeup.absentSchedule?._id;
        return absentId && (absentId.toString() === scheduleId.toString() || absentId.toString() === schedule._id?.toString());
      });
      
      // Kiểm tra xem buổi này có giáo viên dạy thay không
      const hasSubstituteTeacher = pendingMakeupClasses.some(makeup => {
        if (!makeup.isSubstituteClass) return false;
        const absentId = makeup.absentScheduleId || makeup.absentSchedule?.id || makeup.absentSchedule?._id;
        return absentId && (absentId.toString() === scheduleId.toString() || absentId.toString() === schedule._id?.toString());
      });
      
      // Lấy thông tin giáo viên dạy thay nếu có
      const substituteTeacherInfo = hasSubstituteTeacher 
        ? pendingMakeupClasses.find(makeup => {
            if (!makeup.isSubstituteClass) return false;
            const absentId = makeup.absentScheduleId || makeup.absentSchedule?.id || makeup.absentSchedule?._id;
            return absentId && (absentId.toString() === scheduleId.toString() || absentId.toString() === schedule._id?.toString());
          })?.substituteTeacherInfo
        : null;
      
      // Buổi đã bị cancelled (từ StudentSchedule)
      const isCancelled = scheduleStatus === 'cancelled';
      
      // Xác định status hiển thị
      let displayStatus = 'scheduled';
      if (isCancelled || isAbsentSchedule) {
        displayStatus = 'cancelled';
      } else if (scheduleStatus === 'rescheduled' || schedule.status === 'temporary') {
        displayStatus = 'makeup';
      } else if (schedule.status === 'fixed') {
        displayStatus = 'scheduled';
      }
      
      // Kiểm tra xem có phải buổi học bù không (từ database với scheduleStatus: 'rescheduled')
      const isMakeupFromDB = scheduleStatus === 'rescheduled';
      
      // Extract classId - đảm bảo luôn là string ID hoặc null
      let classId = null;
      if (schedule.class) {
        if (typeof schedule.class === 'string') {
          classId = schedule.class;
        } else if (schedule.class._id) {
          classId = schedule.class._id.toString();
        } else if (schedule.class.id) {
          classId = schedule.class.id.toString();
        }
      }
      // Nếu không có trong schedule.class, thử lấy từ classSchedule
      if (!classId && schedule.classSchedule?.class) {
        if (typeof schedule.classSchedule.class === 'string') {
          classId = schedule.classSchedule.class;
        } else if (schedule.classSchedule.class._id) {
          classId = schedule.classSchedule.class._id.toString();
        } else if (schedule.classSchedule.class.id) {
          classId = schedule.classSchedule.class.id.toString();
        }
      }

      return {
        id: scheduleId,
        date: dateStr,
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        className: schedule.class?.name || schedule.classSchedule?.class?.name || 'N/A',
        classId: classId,
        courseId: schedule.class?.course?._id || schedule.class?.course || schedule.classSchedule?.class?.course?._id || schedule.classSchedule?.class?.course || null,
        courseName: schedule.class?.course?.name || schedule.classSchedule?.class?.course?.name || 'N/A',
        roomName: schedule.room?.room_name || 'N/A',
        topic: schedule.session?.title || schedule.topic || '',
        status: displayStatus,
        scheduleStatus: scheduleStatus, // 'scheduled', 'cancelled', 'rescheduled', 'completed', 'pending'
        teacherName: hasSubstituteTeacher 
          ? (substituteTeacherInfo?.username || substituteTeacherInfo?.fullName || substituteTeacherInfo?.name || 'N/A')
          : (schedule.class?.teacher?.username || 'N/A'),
        lessonNumber: schedule.session?.order || '',
        lessonTopic: schedule.session?.title || '',
        sessionName: schedule.session?.title || 'N/A',
        sessionOrder: schedule.session?.order || '',
        attendanceStatus: attendanceStatus, // 'present', 'absent', 'late', 'excused', or null
        hasAttendance: !!attendanceStatus,
        isAbsentSchedule: isAbsentSchedule || (isCancelled && !hasSubstituteTeacher),
        isCancelled: isCancelled && !hasSubstituteTeacher,
        isMakeupSchedule: isMakeupFromDB, // Đánh dấu buổi học bù từ database
        isSubstituteClass: hasSubstituteTeacher, // Đánh dấu có giáo viên dạy thay
        cancellationReason: schedule.studentScheduleReason || null,
        makeupReason: isMakeupFromDB ? schedule.studentScheduleReason : null // Lý do học bù
      };
    });
    
    // Lấy danh sách ID của các buổi học bù đã có trong schedules (từ database)
    const existingMakeupScheduleIds = schedules
      .filter(s => s.isMakeupSchedule || s.scheduleStatus === 'rescheduled')
      .map(s => s.id?.toString() || s._id?.toString());
    
    // Thêm các buổi học bù từ pendingMakeupClasses (chưa được approve)
    // Chỉ thêm những buổi chưa có trong database
    // Bỏ qua các buổi giáo viên dạy thay vì buổi học vẫn diễn ra vào đúng thời gian (chỉ đổi giáo viên)
    const makeupSchedules = pendingMakeupClasses
      .map((makeup, index) => {
        // Bỏ qua nếu là giáo viên dạy thay (buổi học vẫn diễn ra vào đúng thời gian)
        if (makeup.isSubstituteClass) return null;
        
        if (!makeup.makeupSchedule || !makeup.makeupSchedule.date) return null;
        
        const makeupScheduleId = makeup.makeupScheduleId?.toString() || 
                                 makeup.makeupSchedule?.id?.toString() || 
                                 makeup.makeupSchedule?._id?.toString();
        
        // Bỏ qua nếu buổi học bù này đã có trong database
        if (makeupScheduleId && existingMakeupScheduleIds.includes(makeupScheduleId)) {
          return null;
        }
        
        const scheduleDate = new Date(makeup.makeupSchedule.date);
        const dateStr = formatDateToYYYYMMDD(scheduleDate);
        
        return {
          id: `makeup-pending-${index}-${makeupScheduleId}`,
          date: dateStr,
          startTime: makeup.makeupSchedule.startTime || '',
          endTime: makeup.makeupSchedule.endTime || '',
          className: makeup.makeupClassInfo?.className || 'N/A',
          classId: makeup.makeupClassId,
          courseName: makeup.makeupClassInfo?.courseName || 'N/A',
          roomName: makeup.makeupSchedule.roomName || 'N/A',
          topic: makeup.makeupSchedule.title || '',
          status: 'makeup',
          scheduleStatus: 'rescheduled', // Đánh dấu là rescheduled
          lessonNumber: makeup.makeupSchedule.order || '',
          sessionName: makeup.makeupSchedule.title || 'N/A',
          sessionOrder: makeup.makeupSchedule.order || '',
          attendanceStatus: null,
          hasAttendance: false,
          isMakeupSchedule: true
        };
      })
      .filter(Boolean);
    
    return [...schedules, ...makeupSchedules];
  }, [senderSchedule, pendingMakeupClasses]);

  // Validate conflict cho giáo viên dạy thay (chỉ khi senderRole === 'Teacher')
  useEffect(() => {
    const validateSubstituteTeacherConflict = async () => {
      // Chỉ validate khi:
      // 1. Modal đang mở
      // 2. senderRole === 'Teacher'
      // 3. Đã chọn giáo viên dạy thay
      // 4. Đã chọn buổi nghỉ
      if (!showMakeupClassModal || 
          senderRole !== 'Teacher' ||
          !selectedSubstituteTeacherId || 
          !selectedCurrentScheduleId) {
        setConflictInfo(null);
        setValidatingConflict(false);
        return;
      }

      try {
        setValidatingConflict(true);
        
        // Lấy thông tin buổi nghỉ từ calendarSchedules
        const absentScheduleFromCalendar = calendarSchedules?.find(
          s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
        );

        if (!absentScheduleFromCalendar || !absentScheduleFromCalendar.date || 
            !absentScheduleFromCalendar.startTime || !absentScheduleFromCalendar.endTime) {
          setConflictInfo(null);
          setValidatingConflict(false);
          return;
        }

        // Lấy room._id từ senderSchedule gốc (vì calendarSchedules chỉ có roomName)
        const originalSchedule = senderSchedule?.find(
          s => (s._id || s.id)?.toString() === selectedCurrentScheduleId.toString()
        );
        const roomId = originalSchedule?.room?._id || originalSchedule?.room?.id || originalSchedule?.room;

        if (!roomId) {
          console.error('Cannot find room ID for schedule:', selectedCurrentScheduleId);
          setConflictInfo(null);
          setValidatingConflict(false);
          return;
        }

        // Gọi API validate conflict với giáo viên dạy thay
        const validateResponse = await classScheduleService.validateScheduleConflictSimple({
          date: absentScheduleFromCalendar.date,
          startTime: absentScheduleFromCalendar.startTime,
          endTime: absentScheduleFromCalendar.endTime,
          teacher: selectedSubstituteTeacherId,
          room: roomId
        });

        if (validateResponse.success) {
          if (validateResponse.hasConflict) {
            // Format conflict info để hiển thị (chỉ hiển thị conflict với giáo viên)
            // Không hiển thị conflict phòng vì buổi dạy thay diễn ra vào đúng phòng của buổi nghỉ (phòng đã trống)
            const conflictInfo = {
              teacher: validateResponse.conflicts?.teacher || [],
              room: [], // Không check conflict phòng cho giáo viên dạy thay
              students: [] // Không check conflict với học sinh
            };
            // Chỉ set conflict nếu có conflict với giáo viên
            if (conflictInfo.teacher.length > 0) {
              setConflictInfo(conflictInfo);
            } else {
              setConflictInfo(null);
            }
          } else {
            setConflictInfo(null);
          }
        } else {
          setConflictInfo(null);
        }
      } catch (err) {
        console.error('Error validating substitute teacher conflict:', err);
        setConflictInfo(null);
      } finally {
        setValidatingConflict(false);
      }
    };

    // Debounce để tránh gọi API quá nhiều
    const timeoutId = setTimeout(() => {
      validateSubstituteTeacherConflict();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [showMakeupClassModal, senderRole, selectedSubstituteTeacherId, selectedCurrentScheduleId, calendarSchedules, senderSchedule]);

  // Xử lý danh sách lớp học viên đang học
  const studentClasses = useMemo(() => {
    if (!senderSchedule || senderSchedule.length === 0) {
      return [];
    }

    // Nhóm schedule theo class
    const classMap = new Map();

    senderSchedule.forEach(schedule => {
      const classId = schedule.class?._id?.toString() || schedule.class?.toString();
      if (!classId) return;

      if (!classMap.has(classId)) {
        classMap.set(classId, {
          classId: classId,
          className: schedule.class?.name || 'N/A',
          courseName: schedule.class?.course?.name || 'N/A',
          schedules: []
        });
      }

      const classData = classMap.get(classId);
      if (schedule.session) {
        classData.schedules.push({
          date: new Date(schedule.date),
          sessionTitle: schedule.session?.title || 'N/A',
          sessionOrder: schedule.session?.order || null
        });
      }
    });

    // Tìm session đang học (session gần nhất) cho mỗi lớp
    const now = new Date();
    const result = Array.from(classMap.values()).map(classData => {
      // Sắp xếp schedules theo date và sessionOrder
      const sortedSchedules = classData.schedules.sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        return (a.sessionOrder || 0) - (b.sessionOrder || 0);
      });

      // Tìm session gần nhất (đã học hoặc sắp học)
      let currentSession = null;
      
      // Tìm session đã học gần nhất
      const pastSessions = sortedSchedules.filter(s => s.date <= now);
      if (pastSessions.length > 0) {
        currentSession = pastSessions[pastSessions.length - 1];
      } else if (sortedSchedules.length > 0) {
        // Nếu chưa có session nào đã học, lấy session đầu tiên (sắp học)
        currentSession = sortedSchedules[0];
      }

      return {
        classId: classData.classId,
        className: classData.className,
        courseName: classData.courseName,
        currentSessionTitle: currentSession?.sessionTitle || 'Chưa có session',
        currentSessionOrder: currentSession?.sessionOrder || null
      };
    });

    return result;
  }, [senderSchedule]);

  // Helper function để render thông tin lớp (dùng cho hiển thị 2 cột)
  const renderClassInfo = (classInfo, isOldClass = true) => {
    const borderColor = isOldClass ? 'border-primary' : 'border-success';
    const bgColor = isOldClass ? 'bg-primary-25' : 'bg-success-25';
    const textColor = isOldClass ? 'text-primary' : 'text-success';
    const title = isOldClass ? 'Lớp đang học' : 'Lớp muốn đổi';

    return (
      <div className={`border ${borderColor} rounded-4 p-6 ${bgColor}`}>
        <h6 className={`${textColor} fw-bold mb-4 text-12`} style={{ lineHeight: '1.2' }}>{title}</h6>
        <div className="d-flex flex-column" style={{ gap: '2px' }}>
          <div className="d-flex align-items-center" style={{ gap: '6px' }}>
            <small className="text-muted text-11" style={{ minWidth: '65px', lineHeight: '1.3' }}>Tên lớp:</small>
            <div className="fw-semibold text-12" style={{ lineHeight: '1.3' }}>{classInfo.className || 'N/A'}</div>
          </div>
          <div className="d-flex align-items-center" style={{ gap: '6px' }}>
            <small className="text-muted text-11" style={{ minWidth: '65px', lineHeight: '1.3' }}>Khóa học:</small>
            <div className="fw-semibold text-12" style={{ lineHeight: '1.3' }}>{classInfo.courseName || 'N/A'}</div>
          </div>
          <div className="d-flex align-items-center" style={{ gap: '6px' }}>
            <small className="text-muted text-11" style={{ minWidth: '65px', lineHeight: '1.3' }}>Session:</small>
            <div className="fw-semibold text-12" style={{ lineHeight: '1.3' }}>
              {classInfo.currentSessionTitle || 'Chưa có session'}
              {classInfo.currentSessionOrder !== null && (
                <span className="text-neutral-500 ms-1">(STT: {classInfo.currentSessionOrder})</span>
              )}
            </div>
          </div>
          {classInfo.fixedSchedules && classInfo.fixedSchedules.length > 0 ? (
            <div className="d-flex align-items-start" style={{ gap: '6px' }}>
              <small className="text-muted text-11" style={{ minWidth: '65px', lineHeight: '1.3' }}>Lịch học:</small>
              <div className="flex-grow-1" style={{ lineHeight: '1.3' }}>
                {(() => {
                  // Nhóm các buổi học theo thứ, startTime, endTime
                  const scheduleGroups = {};
                  classInfo.fixedSchedules.forEach(schedule => {
                    if (!schedule.date || !schedule.startTime || !schedule.endTime) return;
                    
                    const date = new Date(schedule.date);
                    const dayOfWeek = date.getDay();
                    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                    const dayName = dayNames[dayOfWeek];
                    
                    const formatTime = (timeStr) => {
                      if (!timeStr) return '';
                      const [hours, minutes] = timeStr.split(':');
                      const hourNum = parseInt(hours, 10);
                      return hourNum + 'h';
                    };
                    const startTime = formatTime(schedule.startTime);
                    const endTime = formatTime(schedule.endTime);
                    
                    const key = `${dayOfWeek}-${schedule.startTime}-${schedule.endTime}`;
                    
                    if (!scheduleGroups[key]) {
                      scheduleGroups[key] = {
                        dayOfWeek,
                        dayName,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        startTimeFormatted: startTime,
                        endTimeFormatted: endTime
                      };
                    }
                  });
                  
                  const sortedGroups = Object.values(scheduleGroups).sort((a, b) => {
                    const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                    const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                    if (orderA !== orderB) return orderA - orderB;
                    return a.startTime.localeCompare(b.startTime);
                  });
                  
                  return sortedGroups.map((group, index) => (
                    <div key={index} className="text-12 text-neutral-700" style={{ lineHeight: '1.3' }}>
                      {group.dayName} | {group.startTimeFormatted}-{group.endTimeFormatted}
                    </div>
                  ));
                })()}
              </div>
            </div>
          ) : (
            <div className="text-neutral-500 text-11" style={{ lineHeight: '1.3' }}>Chưa có lịch học cố định</div>
          )}
          {!isOldClass && classInfo.studentCount !== null && (
            <div className="d-flex align-items-center" style={{ gap: '6px' }}>
              <small className="text-muted text-11" style={{ minWidth: '65px', lineHeight: '1.3' }}>Số HS:</small>
              <div className="fw-semibold text-12" style={{ lineHeight: '1.3' }}>
                {classInfo.studentCount !== null ? classInfo.studentCount : 'N/A'}
                {classInfo.roomCapacity !== null && (
                  <span className="text-muted ms-1">/ {classInfo.roomCapacity}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Hàm để mở modal đổi lớp
  const handleChangeClassClick = async (classItem) => {
    // Lấy thông tin đầy đủ của lớp đang học từ senderSchedule
    const classSchedules = senderSchedule.filter(sch => {
      const classId = sch.class?._id?.toString() || sch.class?.toString();
      const targetClassId = (classItem.classId?._id?.toString() || classItem.classId?.toString() || String(classItem.classId));
      return classId === targetClassId;
    });

    let fixedSchedulesList = [];
    let courseId = null;

    // Nếu tìm thấy trong senderSchedule, sử dụng thông tin từ đó
    if (classSchedules.length > 0) {
      // Lọc chỉ lấy các buổi học cố định (fixed), bỏ qua buổi tạm (temporary)
      const fixedSchedules = classSchedules.filter(sch => {
        const status = sch.status || 'fixed';
        return status === 'fixed';
      });
      
      // Sắp xếp schedules theo date và startTime
      const sortedSchedules = [...fixedSchedules].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB;
        }
        return (a.startTime || '').localeCompare(b.startTime || '');
      });

      // Tạo danh sách các buổi học cố định
      fixedSchedulesList = sortedSchedules.map(sch => ({
        title: sch.session?.title || 'N/A',
        order: sch.session?.order || null,
        date: sch.date || null,
        startTime: sch.startTime || 'N/A',
        endTime: sch.endTime || 'N/A',
        roomName: sch.room?.room_name || 'N/A'
      }));

      courseId = classSchedules[0]?.class?.course?._id || classSchedules[0]?.class?.course || null;
    } else {
      // Nếu không tìm thấy trong senderSchedule, sử dụng thông tin từ classItem (từ request)
      // classItem đã có fixedSchedules từ request
      console.log('Không tìm thấy trong senderSchedule, sử dụng thông tin từ classItem');
      console.log('classItem.fixedSchedules:', classItem.fixedSchedules);
      
      if (classItem.fixedSchedules && Array.isArray(classItem.fixedSchedules) && classItem.fixedSchedules.length > 0) {
        // Sắp xếp schedules theo date và startTime
        const sortedSchedules = [...classItem.fixedSchedules].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return (a.startTime || '').localeCompare(b.startTime || '');
        });

        fixedSchedulesList = sortedSchedules.map(sch => ({
          title: sch.session?.title || sch.title || 'N/A',
          order: sch.session?.order || sch.order || null,
          date: sch.date || null,
          startTime: sch.startTime || 'N/A',
          endTime: sch.endTime || 'N/A',
          roomName: sch.roomName || sch.room?.room_name || 'N/A'
        }));

        // Lấy courseId từ classItem nếu có
        courseId = classItem.courseId || null;
      } else {
        // Nếu không có fixedSchedules trong classItem, thử lấy từ API
        console.log('Không có fixedSchedules trong classItem, thử lấy từ API');
        try {
          const classResponse = await classService.getClassById(classItem.classId);
          if (classResponse.success && classResponse.class) {
            const classData = classResponse.class;
            courseId = classData.course?._id || classData.course || null;
            
            // Lấy schedules từ API
            const schedulesResponse = await classService.getClassSchedules(classItem.classId);
            if (schedulesResponse.success && schedulesResponse.schedules) {
              const fixedSchedules = schedulesResponse.schedules.filter(sch => {
                const status = sch.status || 'fixed';
                return status === 'fixed';
              });
              
              const sortedSchedules = [...fixedSchedules].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (dateA.getTime() !== dateB.getTime()) {
                  return dateA - dateB;
                }
                return (a.startTime || '').localeCompare(b.startTime || '');
              });

              fixedSchedulesList = sortedSchedules.map(sch => ({
                title: sch.session?.title || 'N/A',
                order: sch.session?.order || null,
                date: sch.date || null,
                startTime: sch.startTime || 'N/A',
                endTime: sch.endTime || 'N/A',
                roomName: sch.room?.room_name || 'N/A'
              }));
            }
          }
        } catch (err) {
          console.error('Error fetching class info from API:', err);
          // Nếu không lấy được từ API, vẫn tiếp tục với thông tin có sẵn
        }
      }
    }

    // Tạo object thông tin lớp đang học đầy đủ
    const currentClassInfo = {
      classId: classItem.classId,
      className: classItem.className,
      courseName: classItem.courseName,
      courseId: courseId,
      fixedSchedules: fixedSchedulesList,
      roomName: fixedSchedulesList.length > 0 ? fixedSchedulesList[0].roomName : null,
      currentSessionTitle: classItem.currentSessionTitle || 'Chưa có session',
      currentSessionOrder: classItem.currentSessionOrder || null
    };

    setSelectedClassToChange(currentClassInfo);
    setShowChangeClassModal(true);
    setSelectedNewClassId(null);
    setSelectedNewClassInfo(null);
    setAvailableClasses([]);
    setLoadingAvailableClasses(true);

    try {
      if (currentClassInfo.courseId) {
        // Lấy danh sách lớp cùng khóa học
        const response = await classService.getAllClasses({ courseId: currentClassInfo.courseId });
        if (response.success) {
          const classes = response.classes || [];
          // Lọc bỏ lớp hiện tại
          const otherClasses = classes.filter(cls => {
            const clsId = cls._id || cls;
            return clsId.toString() !== classItem.classId?.toString();
          });
          setAvailableClasses(otherClasses);
        }
      }
    } catch (err) {
      console.error('Error fetching available classes:', err);
      setAvailableClasses([]);
    } finally {
      setLoadingAvailableClasses(false);
    }
  };

  // Hàm để lấy thông tin lớp mới khi chọn từ dropdown
  useEffect(() => {
    const fetchNewClassInfo = async () => {
      if (!selectedNewClassId || !classService) {
        setSelectedNewClassInfo(null);
        return;
      }

      try {
        setLoadingNewClassInfo(true);
        const response = await classService.getClassById(selectedNewClassId);
        
        if (response.success && response.class) {
          const classData = response.class;
          
          // Lọc chỉ lấy các buổi học cố định (fixed), bỏ qua buổi tạm (temporary)
          const schedules = classData.schedules || [];
          const fixedSchedules = schedules.filter(sch => {
            const status = sch.status || 'fixed';
            return status === 'fixed';
          });
          
          // Sắp xếp schedules theo date và startTime
          const sortedSchedules = [...fixedSchedules].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA - dateB;
            }
            return (a.startTime || '').localeCompare(b.startTime || '');
          });

          // Tạo danh sách các buổi học cố định
          const fixedSchedulesList = sortedSchedules.map(sch => ({
            title: sch.session?.title || 'N/A',
            order: sch.session?.order || null,
            date: sch.date || null,
            startTime: sch.startTime || 'N/A',
            endTime: sch.endTime || 'N/A',
            roomName: sch.room?.room_name || classData.roomName || 'N/A',
            roomCapacity: sch.room?.capacity || classData.room?.capacity || null
          }));

          // Tính toán session đang học (session gần nhất)
          const now = new Date();
          let currentSessionTitle = 'Chưa có session';
          let currentSessionOrder = null;
          
          if (fixedSchedulesList.length > 0) {
            // Sắp xếp schedules theo date và sessionOrder
            const sortedSessions = [...fixedSchedulesList].sort((a, b) => {
              if (!a.date || !b.date) return 0;
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              const dateDiff = dateA.getTime() - dateB.getTime();
              if (dateDiff !== 0) return dateDiff;
              return (a.order || 0) - (b.order || 0);
            });

            // Tìm session đã học gần nhất
            const pastSessions = sortedSessions.filter(s => {
              if (!s.date) return false;
              return new Date(s.date) <= now;
            });
            
            if (pastSessions.length > 0) {
              const currentSession = pastSessions[pastSessions.length - 1];
              currentSessionTitle = currentSession.title || 'Chưa có session';
              currentSessionOrder = currentSession.order;
            } else if (sortedSessions.length > 0) {
              // Nếu chưa có session nào đã học, lấy session đầu tiên (sắp học)
              const currentSession = sortedSessions[0];
              currentSessionTitle = currentSession.title || 'Chưa có session';
              currentSessionOrder = currentSession.order;
            }
          }

          setSelectedNewClassInfo({
            className: classData.name || 'N/A',
            courseName: classData.courseName || 'N/A',
            fixedSchedules: fixedSchedulesList,
            studentCount: classData.students?.length || 0,
            roomCapacity: classData.room?.capacity || null,
            currentSessionTitle: currentSessionTitle,
            currentSessionOrder: currentSessionOrder
          });
        }
      } catch (err) {
        console.error('Error fetching new class info:', err);
        setSelectedNewClassInfo(null);
      } finally {
        setLoadingNewClassInfo(false);
      }
    };

    fetchNewClassInfo();
  }, [selectedNewClassId, classService]);

  // Hàm để lấy thông tin lớp mới khi chọn từ dropdown (cho buổi học bù)
  useEffect(() => {
    const fetchMakeupClassInfo = async () => {
      if (!selectedMakeupClassId || !classService) {
        setSelectedMakeupClassInfo(null);
        return;
      }

      // Lưu selectedScheduleId hiện tại trước khi fetch để giữ lại nếu hợp lệ
      // React đảm bảo state updates được áp dụng trước khi effects chạy,
      // nên selectedMakeupClassInfo sẽ có giá trị mới nhất
      const currentSelectedScheduleId = selectedMakeupClassInfo?.selectedScheduleId;

      try {
        setLoadingMakeupClassInfo(true);
        const response = await classService.getClassById(selectedMakeupClassId);
        
        if (response.success && response.class) {
          const classData = response.class;
          
          const schedules = classData.schedules || [];
          const fixedSchedules = schedules.filter(sch => {
            const status = sch.status || 'fixed';
            return status === 'fixed';
          });
          
          const sortedSchedules = [...fixedSchedules].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA - dateB;
            }
            return (a.startTime || '').localeCompare(b.startTime || '');
          });

          const fixedSchedulesList = sortedSchedules.map(sch => ({
            id: sch._id || sch.id,
            title: sch.session?.title || 'N/A',
            order: sch.session?.order || null,
            date: sch.date || null,
            startTime: sch.startTime || 'N/A',
            endTime: sch.endTime || 'N/A',
            roomName: sch.room?.room_name || classData.roomName || 'N/A',
            roomCapacity: sch.room?.capacity || classData.room?.capacity || null,
            session: sch.session ? {
              _id: sch.session._id || sch.session.id,
              id: sch.session._id || sch.session.id,
              title: sch.session.title,
              order: sch.session.order
            } : null
          }));

          // Kiểm tra xem selectedScheduleId hiện tại có còn hợp lệ trong danh sách schedules mới không
          let preservedScheduleId = null;
          if (currentSelectedScheduleId) {
            const scheduleIdStr = currentSelectedScheduleId.toString();
            const isValidSchedule = fixedSchedulesList.some(sch => 
              (sch.id || sch._id)?.toString() === scheduleIdStr
            );
            if (isValidSchedule) {
              preservedScheduleId = currentSelectedScheduleId;
            }
          }

          setSelectedMakeupClassInfo({
            className: classData.name || 'N/A',
            courseName: classData.courseName || 'N/A',
            fixedSchedules: fixedSchedulesList,
            schedules: fixedSchedulesList, // Lưu danh sách buổi học để chọn
            studentCount: classData.students?.length || 0,
            roomCapacity: classData.room?.capacity || null,
            selectedScheduleId: preservedScheduleId // Giữ lại nếu hợp lệ, null nếu không
          });
        }
      } catch (err) {
        console.error('Error fetching makeup class info:', err);
        setSelectedMakeupClassInfo(null);
      } finally {
        setLoadingMakeupClassInfo(false);
      }
    };

    fetchMakeupClassInfo();
    // Note: selectedMakeupClassInfo?.selectedScheduleId không được thêm vào dependency array
    // vì effect chỉ nên chạy khi selectedMakeupClassId thay đổi, không phải khi selectedScheduleId thay đổi.
    // React đảm bảo state updates được áp dụng trước khi effects chạy, nên selectedMakeupClassInfo
    // sẽ có giá trị mới nhất khi effect chạy.
  }, [selectedMakeupClassId, classService]);

  // Hàm để lấy thông tin lớp khi chọn buổi học (tự động lấy classId từ schedule)
  useEffect(() => {
    const fetchCurrentClassInfo = async () => {
      if (!selectedCurrentScheduleId || !classService) {
        if (!selectedCurrentScheduleId) {
          setSelectedCurrentClassInfo(null);
          setSelectedCurrentClassId(null);
        }
        return;
      }

      // Tìm schedule đã chọn trong calendarSchedules để lấy classId
      let selectedSchedule = calendarSchedules?.find(s => 
        (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
      );

      let classIdToLoad = null;

      // Nếu tìm thấy trong calendarSchedules và có classId
      if (selectedSchedule && selectedSchedule.classId) {
        classIdToLoad = selectedSchedule.classId;
      } else {
        // Nếu không tìm thấy hoặc không có classId, thử tìm trong senderSchedule gốc
        const originalSchedule = senderSchedule?.find(s => 
          (s._id || s.id)?.toString() === selectedCurrentScheduleId.toString()
        );

        if (originalSchedule) {
          // Lấy classId từ senderSchedule
          classIdToLoad = originalSchedule.class?._id || 
                         originalSchedule.class?.id || 
                         originalSchedule.class ||
                         originalSchedule.classSchedule?.class?._id ||
                         originalSchedule.classSchedule?.class?.id ||
                         originalSchedule.classSchedule?.class ||
                         null;

          // Nếu vẫn không có classId, tạo selectedCurrentClassInfo từ thông tin có sẵn
          if (!classIdToLoad) {
            const className = originalSchedule.class?.name || 
                             originalSchedule.classSchedule?.class?.name || 
                             'N/A';
            const courseName = originalSchedule.class?.course?.name || 
                              originalSchedule.classSchedule?.class?.course?.name ||
                              originalSchedule.class?.courseName ||
                              'N/A';
            
            setSelectedCurrentClassInfo({
              className: className,
              courseName: courseName,
              fixedSchedules: [],
              roomName: originalSchedule.room?.room_name || 'N/A',
              schedules: []
            });
            setSelectedCurrentClassId(null);
            return;
          }
        } else {
          // Không tìm thấy schedule ở đâu cả
          setSelectedCurrentClassInfo(null);
          setSelectedCurrentClassId(null);
          return;
        }
      }

      if (!classIdToLoad) {
        setSelectedCurrentClassInfo(null);
        setSelectedCurrentClassId(null);
        return;
      }

      setSelectedCurrentClassId(classIdToLoad);

      try {
        setLoadingCurrentClassInfo(true);
        const response = await classService.getClassById(classIdToLoad);
        
        if (response.success && response.class) {
          const classData = response.class;
          
          const schedules = classData.schedules || [];
          const fixedSchedules = schedules.filter(sch => {
            const status = sch.status || 'fixed';
            return status === 'fixed';
          });
          
          const sortedSchedules = [...fixedSchedules].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA - dateB;
            }
            return (a.startTime || '').localeCompare(b.startTime || '');
          });

          const fixedSchedulesList = sortedSchedules.map(sch => ({
            id: sch._id || sch.id,
            title: sch.session?.title || 'N/A',
            order: sch.session?.order || null,
            date: sch.date || null,
            startTime: sch.startTime || 'N/A',
            endTime: sch.endTime || 'N/A',
            roomName: sch.room?.room_name || classData.roomName || 'N/A',
            roomCapacity: sch.room?.capacity || classData.room?.capacity || null,
            session: sch.session ? {
              _id: sch.session._id || sch.session.id,
              id: sch.session._id || sch.session.id,
              title: sch.session.title,
              order: sch.session.order
            } : null
          }));

          // Check attendance cho tất cả schedules để filter các buổi đã học
          const schedulesWithAttendance = await Promise.allSettled(
            fixedSchedulesList.map(async (schedule) => {
              try {
                const scheduleId = schedule.id;
                const attendanceResponse = await classScheduleService.getAttendanceByClassSchedule(scheduleId);
                const attendances = attendanceResponse?.list || attendanceResponse?.attendances || (Array.isArray(attendanceResponse) ? attendanceResponse : []) || [];
                // Check nếu có ít nhất một học sinh đã được điểm danh
                const hasAttendance = attendances.some(att => att?.attendance?.status != null);
                return {
                  ...schedule,
                  hasAttendance: hasAttendance
                };
              } catch (err) {
                // Nếu lỗi khi check attendance, coi như chưa có attendance
                console.warn(`Warning: Could not check attendance for schedule ${schedule.id}:`, err);
                return {
                  ...schedule,
                  hasAttendance: false
                };
              }
            })
          );

          // Lọc các schedule đã có attendance (đã học)
          const schedulesWithoutAttendance = schedulesWithAttendance
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value)
            .filter(schedule => !schedule.hasAttendance); // Chỉ lấy các buổi chưa có attendance

          setSelectedCurrentClassInfo({
            className: classData.name || 'N/A',
            courseName: classData.courseName || 'N/A',
            fixedSchedules: fixedSchedulesList,
            roomName: fixedSchedulesList.length > 0 ? fixedSchedulesList[0].roomName : null,
            schedules: schedulesWithoutAttendance // Chỉ lưu các buổi chưa học
          });
        }
      } catch (err) {
        console.error('Error fetching current class info:', err);
        setSelectedCurrentClassInfo(null);
        setSelectedCurrentClassId(null);
      } finally {
        setLoadingCurrentClassInfo(false);
      }
    };

    fetchCurrentClassInfo();
  }, [selectedCurrentScheduleId, classService, calendarSchedules, senderSchedule]);

  // Load danh sách lớp cùng khóa học khi selectedCurrentClassInfo thay đổi
  useEffect(() => {
    const loadAvailableClasses = async () => {
      if (selectedCurrentClassInfo && selectedCurrentClassInfo.courseName) {
        setLoadingMakeupClasses(true);
        try {
          // Lấy courseId từ senderSchedule
          const classSchedules = senderSchedule.filter(sch => {
            const classId = sch.class?._id?.toString() || sch.class?.toString();
            return classId === selectedCurrentClassId;
          });

          if (classSchedules.length > 0) {
            const courseId = classSchedules[0]?.class?.course?._id || classSchedules[0]?.class?.course || null;
            if (courseId) {
              const response = await classService.getAllClasses({ courseId });
              if (response.success) {
                const classes = response.classes || [];
                setAvailableMakeupClasses(classes);
                
                // Load schedules cho tất cả các lớp để filter
                const classesWithSchedules = await Promise.all(
                  classes.map(async (cls) => {
                    try {
                      const classId = cls._id || cls;
                      const classResponse = await classService.getClassById(classId);
                      if (classResponse.success && classResponse.class) {
                        const classData = classResponse.class;
                        const schedules = classData.schedules || [];
                        const fixedSchedules = schedules.filter(sch => {
                          const status = sch.status || 'fixed';
                          return status === 'fixed';
                        });
                        
                        const fixedSchedulesList = fixedSchedules.map(sch => ({
                          id: sch._id || sch.id,
                          title: sch.session?.title || 'N/A',
                          order: sch.session?.order || null,
                          date: sch.date || null,
                          startTime: sch.startTime || 'N/A',
                          endTime: sch.endTime || 'N/A'
                        }));
                        
                        return {
                          ...cls,
                          schedules: fixedSchedulesList
                        };
                      }
                      return { ...cls, schedules: [] };
                    } catch (err) {
                      console.error(`Error loading schedules for class ${cls._id}:`, err);
                      return { ...cls, schedules: [] };
                    }
                  })
                );
                
                setAvailableMakeupClassesWithSchedules(classesWithSchedules);
              }
            }
          }
        } catch (err) {
          console.error('Error fetching available classes:', err);
          setAvailableMakeupClasses([]);
        } finally {
          setLoadingMakeupClasses(false);
        }
      }
    };

    loadAvailableClasses();
  }, [selectedCurrentClassInfo, selectedCurrentClassId, senderSchedule, classService]);

  // Helper function để kiểm tra conflict với lịch học của sinh viên
  const checkScheduleConflict = (schedule, studentSchedules, excludeScheduleId = null) => {
    if (!schedule.date || !schedule.startTime || !schedule.endTime || !studentSchedules || studentSchedules.length === 0) {
      return false;
    }
    
    const scheduleDate = new Date(schedule.date);
    scheduleDate.setHours(0, 0, 0, 0);
    
    // Helper để check time overlap
    // Chuyển đổi thời gian từ string "HH:MM" sang phút để so sánh chính xác
    const hasTimeOverlap = (start1, end1, start2, end2) => {
      const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 0;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        return hours * 60 + minutes;
      };
      
      const start1Min = timeToMinutes(start1);
      const end1Min = timeToMinutes(end1);
      const start2Min = timeToMinutes(start2);
      const end2Min = timeToMinutes(end2);
      
      // Hai khoảng thời gian overlap nếu: start1 < end2 VÀ end1 > start2
      // Lưu ý: Nếu một lớp kết thúc đúng lúc lớp kia bắt đầu (ví dụ: 08:00-10:00 và 10:00-12:00)
      // thì KHÔNG có overlap vì sử dụng > và < (không có =)
      return start1Min < end2Min && end1Min > start2Min;
    };
    
    // Kiểm tra từng buổi học của sinh viên
    for (const studentSchedule of studentSchedules) {
      // Loại trừ buổi nghỉ (nếu có)
      if (excludeScheduleId) {
        const studentScheduleId = studentSchedule._id || studentSchedule.id;
        if (studentScheduleId && studentScheduleId.toString() === excludeScheduleId.toString()) {
          continue;
        }
      }
      
      if (!studentSchedule.date || !studentSchedule.startTime || !studentSchedule.endTime) {
        continue;
      }
      
      const studentDate = new Date(studentSchedule.date);
      studentDate.setHours(0, 0, 0, 0);
      
      // Kiểm tra cùng ngày
      if (scheduleDate.getTime() === studentDate.getTime()) {
        // Kiểm tra time overlap
        if (hasTimeOverlap(
          schedule.startTime, 
          schedule.endTime, 
          studentSchedule.startTime, 
          studentSchedule.endTime
        )) {
          return true; // Có conflict
        }
      }
    }
    
    return false; // Không có conflict
  };

  // Lọc các buổi nghỉ đã được chọn
  const filteredAbsentSchedules = useMemo(() => {
    if (!calendarSchedules || calendarSchedules.length === 0) {
      return [];
    }
    
    // Lấy danh sách các absentScheduleId đã được chọn
    const selectedAbsentScheduleIds = (pendingMakeupClasses || []).map(makeup => {
      return makeup.absentScheduleId?.toString() || 
             makeup.absentSchedule?.id?.toString() || 
             makeup.absentSchedule?._id?.toString();
    }).filter(Boolean);
    
    // Lọc bỏ các buổi đã được chọn, đã hủy và format để hiển thị
    return calendarSchedules
      .filter(schedule => {
        const scheduleId = (schedule.id || schedule._id)?.toString();
        const scheduleStatus = schedule.scheduleStatus || 'scheduled';
        // Loại bỏ các buổi đã được chọn và đã bị hủy
        return scheduleId && 
               !selectedAbsentScheduleIds.includes(scheduleId) &&
               scheduleStatus !== 'cancelled';
      })
      .map(schedule => ({
        id: schedule.id,
        _id: schedule.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        title: schedule.sessionName || schedule.lessonTopic || 'N/A',
        order: schedule.sessionOrder || schedule.lessonNumber || null,
        classId: schedule.classId,
        courseName: schedule.courseName,
        className: schedule.className,
        scheduleStatus: schedule.scheduleStatus || 'scheduled',
        roomName: schedule.roomName,
        isMakeupSchedule: schedule.isMakeupSchedule || schedule.scheduleStatus === 'rescheduled'
      }));
  }, [calendarSchedules, pendingMakeupClasses]);

  // Filter các lớp có buổi học bù phù hợp
  const filteredMakeupClasses = useMemo(() => {
    if (!selectedCurrentScheduleId || !availableMakeupClassesWithSchedules || availableMakeupClassesWithSchedules.length === 0) {
      return availableMakeupClasses || [];
    }
    
    // Lấy thông tin buổi nghỉ từ calendarSchedules
    const currentSchedule = calendarSchedules?.find(
      s => (s.id || s._id)?.toString() === selectedCurrentScheduleId?.toString()
    ) || selectedCurrentClassInfo?.schedules?.find(
      s => (s.id || s._id) === selectedCurrentScheduleId
    );
    const currentSessionOrder = currentSchedule?.sessionOrder || currentSchedule?.order;
    const currentScheduleDate = currentSchedule?.date;
    
    if (!currentSessionOrder || !currentScheduleDate) {
      return availableMakeupClasses || [];
    }
    
    // Lấy danh sách các makeupScheduleId đã được chọn
    const selectedMakeupScheduleIds = (pendingMakeupClasses || []).map(makeup => {
      return makeup.makeupScheduleId?.toString() || 
             makeup.makeupSchedule?.id?.toString() || 
             makeup.makeupSchedule?._id?.toString();
    }).filter(Boolean);
    
    // Filter các lớp có ít nhất một buổi phù hợp
    const classesWithValidSchedules = availableMakeupClassesWithSchedules.filter(classWithSchedule => {
      if (!classWithSchedule.schedules || classWithSchedule.schedules.length === 0) {
        return false;
      }
      
      // Kiểm tra xem lớp này có buổi nào cùng session và sau ngày buổi nghỉ không
      const hasValidSchedule = classWithSchedule.schedules.some(schedule => {
        // Bỏ qua buổi đã được chọn
        const scheduleId = (schedule.id || schedule._id)?.toString();
        if (scheduleId && selectedMakeupScheduleIds.includes(scheduleId)) {
          return false;
        }
        
        // Không cho phép chọn buổi nghỉ làm buổi học bù
        if (scheduleId && selectedCurrentScheduleId && scheduleId === selectedCurrentScheduleId.toString()) {
          return false;
        }
        
        // Cùng session order
        if (schedule.order !== currentSessionOrder) {
          return false;
        }
        
        // Ngày sau ngày hiện tại
        if (schedule.date) {
          const scheduleDate = new Date(schedule.date);
          const today = new Date();
          scheduleDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          
          if (scheduleDate.getTime() <= today.getTime()) {
            return false;
          }
        }
        
        // Kiểm tra conflict với lịch học của sinh viên
        // Nếu có đổi lớp, check với lịch lớp mới; nếu không, check với lịch hiện tại
        const scheduleToCheck = pendingClassChange && pendingClassChange.newClassId 
          ? newClassSchedule 
          : senderSchedule;
        if (checkScheduleConflict(schedule, scheduleToCheck, selectedCurrentScheduleId)) {
          return false;
        }
        
        return true;
      });
      
      return hasValidSchedule;
    });
    
    return classesWithValidSchedules;
  }, [selectedCurrentScheduleId, availableMakeupClassesWithSchedules, selectedCurrentClassInfo, availableMakeupClasses, senderSchedule, pendingMakeupClasses, pendingClassChange, newClassSchedule]);

  // Tự động load dữ liệu khi mở modal "Thêm buổi học bù"
  useEffect(() => {
    if (showMakeupClassModal && !makeupClassOption && studentClasses.length > 0) {
      setMakeupClassOption('existing');
      // Set lớp đầu tiên làm mặc định
      const firstClass = studentClasses[0];
      setSelectedCurrentClassId(firstClass.classId);
    }
  }, [showMakeupClassModal, studentClasses, makeupClassOption]);

  // Load danh sách giáo viên khi mở modal "Xếp lịch dạy thay" (chỉ cho Teacher)
  useEffect(() => {
    const loadSubstituteTeachers = async () => {
      if (showMakeupClassModal && senderRole === 'Teacher') {
        setLoadingSubstituteTeachers(true);
        try {
          const response = await teacherService.getAllTeachers();
          if (response && (response.teachers || response.data)) {
            const allTeachers = response.teachers || response.data || [];
            
            // Lấy giáo viên hiện tại của lớp từ schedule đã chọn (nếu có)
            let currentTeacherId = null;
            if (selectedCurrentScheduleId && senderSchedule && senderSchedule.length > 0) {
              const selectedSchedule = senderSchedule.find(
                s => (s._id || s.id)?.toString() === selectedCurrentScheduleId.toString()
              );
              
              if (selectedSchedule) {
                // Lấy teacher từ class hoặc từ schedule trực tiếp
                currentTeacherId = selectedSchedule.class?.teacher?._id || 
                                  selectedSchedule.class?.teacher?.id ||
                                  selectedSchedule.class?.teacher ||
                                  selectedSchedule.teacher?._id ||
                                  selectedSchedule.teacher?.id ||
                                  selectedSchedule.teacher ||
                                  null;
                
                // Convert to string for comparison
                if (currentTeacherId) {
                  currentTeacherId = currentTeacherId.toString();
                }
              }
            }
            
            // Lọc bỏ giáo viên hiện tại của lớp
            const filteredTeachers = allTeachers.filter(teacher => {
              const teacherId = (teacher._id || teacher.id)?.toString();
              return teacherId && teacherId !== currentTeacherId;
            });
            
            setAvailableSubstituteTeachers(filteredTeachers);
          } else {
            setAvailableSubstituteTeachers([]);
          }
        } catch (err) {
          console.error('Error loading substitute teachers:', err);
          setAvailableSubstituteTeachers([]);
        } finally {
          setLoadingSubstituteTeachers(false);
        }
      } else {
        setAvailableSubstituteTeachers([]);
        setSelectedSubstituteTeacherId(null);
      }
    };

    loadSubstituteTeachers();
  }, [showMakeupClassModal, senderRole, selectedCurrentScheduleId, senderSchedule]);

  // Load lịch lớp mới khi có đổi lớp
  useEffect(() => {
    const loadNewClassSchedule = async () => {
      if (!pendingClassChange || !pendingClassChange.newClassId) {
        setNewClassSchedule([]);
        return;
      }

      try {
        const response = await classService.getClassById(pendingClassChange.newClassId);
        if (response.success && response.class) {
          const schedules = response.class.schedules || [];
          // Chuyển đổi format lịch từ class.schedules sang format tương thích với checkScheduleConflict
          const formattedSchedules = schedules
            .filter(sch => sch.status === 'fixed' || sch.status === 'temporary')
            .map(sch => ({
              _id: sch._id || sch.id,
              date: sch.date,
              startTime: sch.startTime,
              endTime: sch.endTime,
              class: {
                _id: response.class._id,
                name: response.class.name
              },
              room: sch.room,
              session: sch.session
            }));
          setNewClassSchedule(formattedSchedules);
        } else {
          setNewClassSchedule([]);
        }
      } catch (err) {
        console.error('Error loading new class schedule:', err);
        setNewClassSchedule([]);
      }
    };

    loadNewClassSchedule();
  }, [pendingClassChange]);

  // Load danh sách giáo viên và phòng khi mở modal tạo lớp mới
  // Đã xóa vì không còn sử dụng tùy chọn "Tạo lớp mới"
  // useEffect(() => {
  //   const loadTeachersAndRooms = async () => {
  //     if (showMakeupClassModal && makeupClassOption === 'new') {
  //       // Load teachers
  //       setLoadingTeachers(true);
  //       try {
  //         const teachersResponse = await teacherService.getAllTeachers();
  //         if (teachersResponse.success) {
  //           setAvailableTeachers(teachersResponse.teachers || []);
  //         }
  //       } catch (err) {
  //         console.error('Error loading teachers:', err);
  //         setAvailableTeachers([]);
  //       } finally {
  //         setLoadingTeachers(false);
  //       }

  //       // Load rooms
  //       setLoadingRooms(true);
  //       try {
  //         const roomsResponse = await roomService.getAllRooms();
  //         console.log('Rooms response:', roomsResponse);
  //         // API trả về { message, total, rooms } hoặc { success, data }
  //         if (roomsResponse.rooms) {
  //           setAvailableRooms(roomsResponse.rooms || []);
  //         } else if (roomsResponse.data) {
  //           setAvailableRooms(roomsResponse.data || []);
  //         } else if (roomsResponse.success && roomsResponse.data) {
  //           setAvailableRooms(roomsResponse.data || []);
  //         } else {
  //           console.warn('Unexpected rooms response format:', roomsResponse);
  //           setAvailableRooms([]);
  //         }
  //       } catch (err) {
  //         console.error('Error loading rooms:', err);
  //         setAvailableRooms([]);
  //       } finally {
  //         setLoadingRooms(false);
  //       }
  //     }
  //   };

  //   loadTeachersAndRooms();
  // }, [showMakeupClassModal, makeupClassOption]);

  // Validate conflict khi chọn giáo viên/phòng học trong phần tạo lớp mới
  // Đã xóa vì không còn sử dụng tùy chọn "Tạo lớp mới"
  // useEffect(() => {
  //   const validateNewMakeupConflict = async () => {
  //     // Chỉ validate khi:
  //     // 1. Modal đang mở và chọn "Tạo lớp mới"
  //     // 2. Đã có đủ thông tin: date, startTime, endTime, teacher, room
  //     if (!showMakeupClassModal || 
  //         makeupClassOption !== 'new' ||
  //         !newMakeupDate || 
  //         !newMakeupStartTime || 
  //         !newMakeupEndTime || 
  //         !newMakeupTeacherId || 
  //         !newMakeupRoomId) {
  //       setConflictInfo(null);
  //       return;
  //     }

  //     try {
  //       setValidatingConflict(true);
        
  //       // Gọi API validate conflict đơn giản (không cần classId)
  //       const validateResponse = await classScheduleService.validateScheduleConflictSimple({
  //         date: newMakeupDate,
  //         startTime: newMakeupStartTime,
  //         endTime: newMakeupEndTime,
  //         room: newMakeupRoomId,
  //         teacher: newMakeupTeacherId
  //       });

  //       if (validateResponse.success) {
  //         if (validateResponse.hasConflict) {
  //           // Format conflict info để hiển thị
  //           const conflictInfo = {
  //             teacher: validateResponse.conflicts?.teacher || [],
  //             room: validateResponse.conflicts?.room || [],
  //             students: validateResponse.conflicts?.students || []
  //           };
  //           setConflictInfo(conflictInfo);
  //         } else {
  //           setConflictInfo(null);
  //         }
  //       } else {
  //         setConflictInfo(null);
  //       }
  //     } catch (err) {
  //       console.error('Error validating new makeup conflict:', err);
  //       // Không hiển thị lỗi, chỉ log
  //       setConflictInfo(null);
  //     } finally {
  //       setValidatingConflict(false);
  //     }
  //   };

  //   // Debounce để tránh gọi API quá nhiều
  //   const timeoutId = setTimeout(() => {
  //     validateNewMakeupConflict();
  //   }, 500);

  //   return () => clearTimeout(timeoutId);
  // }, [showMakeupClassModal, makeupClassOption, newMakeupDate, newMakeupStartTime, newMakeupEndTime, newMakeupTeacherId, newMakeupRoomId]);

  // Hàm xử lý lưu buổi học bù
  const handleSaveMakeupClass = async () => {
    if (makeupClassOption === 'existing') {
      // Xử lý trường hợp giáo viên dạy thay
      if (senderRole === 'Teacher') {
        if (!selectedCurrentScheduleId || !selectedSubstituteTeacherId) {
          alert('Vui lòng chọn đầy đủ buổi nghỉ và giáo viên dạy thay');
          return;
        }

        // Kiểm tra conflict - không cho tiếp tục nếu có conflict với giáo viên (không check conflict phòng vì phòng đã trống)
        if (conflictInfo && conflictInfo.teacher?.length > 0) {
          alert('Không thể tiếp tục khi có xung đột lịch học. Vui lòng chọn giáo viên dạy thay khác.');
          return;
        }

        try {
          setProcessing(true);

          // Lấy thông tin buổi nghỉ đã chọn từ calendarSchedules
          let absentScheduleFromCalendar = calendarSchedules?.find(
            s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
          );

          // Lưu schedule gốc để lấy thông tin lớp nếu cần
          let originalSchedule = null;

          // Nếu không tìm thấy trong calendarSchedules, thử tìm trong senderSchedule
          if (!absentScheduleFromCalendar && senderSchedule && senderSchedule.length > 0) {
            const scheduleFromSender = senderSchedule.find(
              s => (s._id || s.id)?.toString() === selectedCurrentScheduleId.toString()
            );
            
            if (scheduleFromSender) {
              originalSchedule = scheduleFromSender;
              // Format từ senderSchedule để tương thích với calendarSchedules
              const scheduleDate = new Date(scheduleFromSender.date);
              const dateStr = formatDateToYYYYMMDD(scheduleDate);
              
              absentScheduleFromCalendar = {
                id: scheduleFromSender._id || scheduleFromSender.id,
                date: dateStr,
                startTime: scheduleFromSender.startTime || '',
                endTime: scheduleFromSender.endTime || '',
                sessionName: scheduleFromSender.session?.title || 'N/A',
                lessonTopic: scheduleFromSender.session?.title || '',
                sessionOrder: scheduleFromSender.session?.order || '',
                lessonNumber: scheduleFromSender.session?.order || '',
                classId: scheduleFromSender.class?._id || scheduleFromSender.class?.id || scheduleFromSender.class,
                className: scheduleFromSender.class?.name || null,
                courseName: scheduleFromSender.class?.course?.name || scheduleFromSender.class?.courseName || null
              };
            }
          }

          // Nếu vẫn không tìm thấy, thử lấy từ selectedRequest.studentScheduleId
          if (!absentScheduleFromCalendar && selectedRequest && selectedRequest.studentScheduleId) {
            const studentSchedule = selectedRequest.studentScheduleId;
            const studentScheduleId = (studentSchedule._id || studentSchedule.id)?.toString();
            
            if (studentScheduleId === selectedCurrentScheduleId.toString()) {
              originalSchedule = studentSchedule;
              const scheduleDate = new Date(studentSchedule.date);
              const dateStr = formatDateToYYYYMMDD(scheduleDate);
              
              absentScheduleFromCalendar = {
                id: studentScheduleId,
                date: dateStr,
                startTime: studentSchedule.startTime || '',
                endTime: studentSchedule.endTime || '',
                sessionName: studentSchedule.session?.title || studentSchedule.classSchedule?.session?.title || 'N/A',
                lessonTopic: studentSchedule.session?.title || studentSchedule.classSchedule?.session?.title || '',
                sessionOrder: studentSchedule.session?.order || studentSchedule.classSchedule?.session?.order || '',
                lessonNumber: studentSchedule.session?.order || studentSchedule.classSchedule?.session?.order || '',
                classId: studentSchedule.classSchedule?.class?._id || studentSchedule.classSchedule?.class?.id || studentSchedule.classSchedule?.class || studentSchedule.class?._id || studentSchedule.class?.id || studentSchedule.class,
                className: studentSchedule.classSchedule?.class?.name || studentSchedule.class?.name || null,
                courseName: studentSchedule.classSchedule?.class?.course?.name || studentSchedule.class?.course?.name || studentSchedule.classSchedule?.class?.courseName || null
              };
            }
          }

          // Nếu tìm thấy trong calendarSchedules, lấy thông tin lớp từ đó
          if (absentScheduleFromCalendar && !originalSchedule) {
            originalSchedule = calendarSchedules?.find(
              s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
            );
            if (originalSchedule && !absentScheduleFromCalendar.classId) {
              absentScheduleFromCalendar.classId = originalSchedule.classId;
              absentScheduleFromCalendar.className = originalSchedule.className;
              absentScheduleFromCalendar.courseName = originalSchedule.courseName;
            }
          }

          if (!absentScheduleFromCalendar) {
            alert('Không tìm thấy thông tin buổi nghỉ');
            setProcessing(false);
            return;
          }

          // Lấy thông tin giáo viên dạy thay
          const substituteTeacher = availableSubstituteTeachers.find(
            t => (t._id || t.id) === selectedSubstituteTeacherId
          );

          if (!substituteTeacher) {
            alert('Không tìm thấy thông tin giáo viên dạy thay');
            setProcessing(false);
            return;
          }

          // Format absentSchedule để tương thích với code hiện tại
          const absentSchedule = {
            id: absentScheduleFromCalendar.id,
            _id: absentScheduleFromCalendar.id,
            date: absentScheduleFromCalendar.date,
            startTime: absentScheduleFromCalendar.startTime,
            endTime: absentScheduleFromCalendar.endTime,
            title: absentScheduleFromCalendar.sessionName || absentScheduleFromCalendar.lessonTopic,
            order: absentScheduleFromCalendar.sessionOrder || absentScheduleFromCalendar.lessonNumber,
            session: absentScheduleFromCalendar.sessionOrder ? {
              order: absentScheduleFromCalendar.sessionOrder,
              title: absentScheduleFromCalendar.sessionName
            } : null
          };

          // Lấy thông tin lớp cho absentClassInfo nếu selectedCurrentClassInfo là null
          let absentClassInfoToUse = selectedCurrentClassInfo;
          if (!absentClassInfoToUse && (absentScheduleFromCalendar.className || absentScheduleFromCalendar.classId)) {
            absentClassInfoToUse = {
              className: absentScheduleFromCalendar.className || 'N/A',
              courseName: absentScheduleFromCalendar.courseName || 'N/A'
            };
          }

          // Lưu thông tin buổi dạy thay
          const newMakeupEntry = {
            absentScheduleId: selectedCurrentScheduleId,
            absentSchedule: absentSchedule,
            absentClassId: absentScheduleFromCalendar.classId || selectedCurrentClassId,
            absentClassInfo: absentClassInfoToUse,
            // Thông tin giáo viên dạy thay
            substituteTeacherId: selectedSubstituteTeacherId,
            substituteTeacherInfo: substituteTeacher,
            // Buổi dạy thay sẽ diễn ra vào đúng thời gian của buổi nghỉ
            makeupSchedule: {
              date: absentScheduleFromCalendar.date,
              startTime: absentScheduleFromCalendar.startTime,
              endTime: absentScheduleFromCalendar.endTime,
              roomName: absentScheduleFromCalendar.roomName || 'N/A',
              teacherName: substituteTeacher?.username || substituteTeacher?.fullName || substituteTeacher?.name || 'N/A'
            },
            // Đánh dấu đây là buổi dạy thay (không phải buổi học bù)
            isSubstituteClass: true
          };

          setPendingMakeupClasses(prev => [...prev, newMakeupEntry]);
          
          // Reset và đóng modal
          resetMakeupModalState();
          
        } catch (err) {
          console.error('Error saving substitute class:', err);
          alert(err.message || 'Có lỗi xảy ra khi lưu buổi dạy thay');
        } finally {
          setProcessing(false);
        }
        return;
      }

      // Xử lý trường hợp chọn buổi có sẵn (cho học sinh)
      if (!selectedCurrentScheduleId || !selectedMakeupClassInfo?.selectedScheduleId) {
        alert('Vui lòng chọn đầy đủ buổi học ở cả 2 cột');
        return;
      }

      try {
        setProcessing(true);
        
        // Lấy thông tin buổi học bù từ fixedSchedules
        const makeupSchedule = selectedMakeupClassInfo.fixedSchedules?.find(
          s => (s.id || s._id) === selectedMakeupClassInfo.selectedScheduleId
        ) || selectedMakeupClassInfo.schedules?.find(
          s => (s.id || s._id) === selectedMakeupClassInfo.selectedScheduleId
        );

        if (!makeupSchedule) {
          alert('Không tìm thấy thông tin buổi học bù');
          setProcessing(false);
          return;
        }

        // Lấy thông tin buổi nghỉ đã chọn từ calendarSchedules
        let absentScheduleFromCalendar = calendarSchedules?.find(
          s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
        );

        // Lưu schedule gốc để lấy thông tin lớp nếu cần
        let originalSchedule = null;

        // Nếu không tìm thấy trong calendarSchedules, thử tìm trong senderSchedule
        if (!absentScheduleFromCalendar && senderSchedule && senderSchedule.length > 0) {
          const scheduleFromSender = senderSchedule.find(
            s => (s._id || s.id)?.toString() === selectedCurrentScheduleId.toString()
          );
          
          if (scheduleFromSender) {
            originalSchedule = scheduleFromSender;
            // Format từ senderSchedule để tương thích với calendarSchedules
            const scheduleDate = new Date(scheduleFromSender.date);
            const dateStr = formatDateToYYYYMMDD(scheduleDate);
            
            absentScheduleFromCalendar = {
              id: scheduleFromSender._id || scheduleFromSender.id,
              date: dateStr,
              startTime: scheduleFromSender.startTime || '',
              endTime: scheduleFromSender.endTime || '',
              sessionName: scheduleFromSender.session?.title || 'N/A',
              lessonTopic: scheduleFromSender.session?.title || '',
              sessionOrder: scheduleFromSender.session?.order || '',
              lessonNumber: scheduleFromSender.session?.order || '',
              classId: scheduleFromSender.class?._id || scheduleFromSender.class?.id || scheduleFromSender.class,
              className: scheduleFromSender.class?.name || null,
              courseName: scheduleFromSender.class?.course?.name || scheduleFromSender.class?.courseName || null
            };
          }
        }

        // Nếu vẫn không tìm thấy, thử lấy từ selectedRequest.studentScheduleId
        if (!absentScheduleFromCalendar && selectedRequest && selectedRequest.studentScheduleId) {
          const studentSchedule = selectedRequest.studentScheduleId;
          const studentScheduleId = (studentSchedule._id || studentSchedule.id)?.toString();
          
          if (studentScheduleId === selectedCurrentScheduleId.toString()) {
            originalSchedule = studentSchedule;
            const scheduleDate = new Date(studentSchedule.date);
            const dateStr = formatDateToYYYYMMDD(scheduleDate);
            
            absentScheduleFromCalendar = {
              id: studentScheduleId,
              date: dateStr,
              startTime: studentSchedule.startTime || '',
              endTime: studentSchedule.endTime || '',
              sessionName: studentSchedule.session?.title || studentSchedule.classSchedule?.session?.title || 'N/A',
              lessonTopic: studentSchedule.session?.title || studentSchedule.classSchedule?.session?.title || '',
              sessionOrder: studentSchedule.session?.order || studentSchedule.classSchedule?.session?.order || '',
              lessonNumber: studentSchedule.session?.order || studentSchedule.classSchedule?.session?.order || '',
              classId: studentSchedule.classSchedule?.class?._id || studentSchedule.classSchedule?.class?.id || studentSchedule.classSchedule?.class || studentSchedule.class?._id || studentSchedule.class?.id || studentSchedule.class,
              className: studentSchedule.classSchedule?.class?.name || studentSchedule.class?.name || null,
              courseName: studentSchedule.classSchedule?.class?.course?.name || studentSchedule.class?.course?.name || studentSchedule.classSchedule?.class?.courseName || null
            };
          }
        }

        // Nếu tìm thấy trong calendarSchedules, lấy thông tin lớp từ đó
        if (absentScheduleFromCalendar && !originalSchedule) {
          originalSchedule = calendarSchedules?.find(
            s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
          );
          if (originalSchedule && !absentScheduleFromCalendar.classId) {
            absentScheduleFromCalendar.classId = originalSchedule.classId;
            absentScheduleFromCalendar.className = originalSchedule.className;
            absentScheduleFromCalendar.courseName = originalSchedule.courseName;
          }
        }

        if (!absentScheduleFromCalendar) {
          alert('Không tìm thấy thông tin buổi nghỉ');
          setProcessing(false);
          return;
        }

        // Format absentSchedule để tương thích với code hiện tại
        const absentSchedule = {
          id: absentScheduleFromCalendar.id,
          _id: absentScheduleFromCalendar.id,
          date: absentScheduleFromCalendar.date,
          startTime: absentScheduleFromCalendar.startTime,
          endTime: absentScheduleFromCalendar.endTime,
          title: absentScheduleFromCalendar.sessionName || absentScheduleFromCalendar.lessonTopic,
          order: absentScheduleFromCalendar.sessionOrder || absentScheduleFromCalendar.lessonNumber,
          session: absentScheduleFromCalendar.sessionOrder ? {
            order: absentScheduleFromCalendar.sessionOrder,
            title: absentScheduleFromCalendar.sessionName
          } : null
        };

        // Lấy thông tin lớp cho absentClassInfo nếu selectedCurrentClassInfo là null
        let absentClassInfoToUse = selectedCurrentClassInfo;
        if (!absentClassInfoToUse && (absentScheduleFromCalendar.className || absentScheduleFromCalendar.classId)) {
          absentClassInfoToUse = {
            className: absentScheduleFromCalendar.className || 'N/A',
            courseName: absentScheduleFromCalendar.courseName || 'N/A'
          };
        }

        // Kiểm tra conflict - không cho tiếp tục nếu có conflict với students
        if (conflictInfo && conflictInfo.students && conflictInfo.students.length > 0) {
          alert('Không thể tiếp tục khi có xung đột lịch học. Vui lòng chọn buổi học bù khác.');
          setProcessing(false);
          return;
        }

        // Lưu thông tin buổi học bù
        const newMakeupEntry = {
          absentScheduleId: selectedCurrentScheduleId,
          absentSchedule: absentSchedule,
          absentClassId: absentScheduleFromCalendar.classId || selectedCurrentClassId,
          absentClassInfo: absentClassInfoToUse,
          makeupScheduleId: selectedMakeupClassInfo.selectedScheduleId,
          makeupSchedule: makeupSchedule,
          makeupClassId: selectedMakeupClassId,
          makeupClassInfo: selectedMakeupClassInfo
        };

        setPendingMakeupClasses(prev => [...prev, newMakeupEntry]);
        
        // Reset và đóng modal
        resetMakeupModalState();
        
      } catch (err) {
        console.error('Error saving makeup class:', err);
        alert(err.message || 'Có lỗi xảy ra khi lưu buổi học bù');
      } finally {
        setProcessing(false);
      }
    }
  };

  // Hàm reset state khi đóng modal
  const resetMakeupModalState = () => {
    setShowMakeupClassModal(false);
    setMakeupClassOption(null);
    setSelectedCurrentClassId(null);
    setSelectedCurrentClassInfo(null);
    setSelectedCurrentScheduleId(null);
    setSelectedMakeupClassId(null);
    setShowAbsentScheduleList(true);
    setSelectedMakeupClassInfo(null);
    setAvailableMakeupClasses([]);
    setConflictInfo(null);
    setPendingMakeupData(null);
    setValidatingConflict(false);
    // Reset giáo viên dạy thay
    setSelectedSubstituteTeacherId(null);
  };

  // Hàm để mở modal chi tiết khi chấp nhận
  const handleApproveClick = async (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
    setRejectReason('');
    setLoadingSchedule(true);
    setSenderSchedule([]);
    setSenderRole(null);
    
    try {
      const response = await changeRequestService.getSenderSchedule(request._id);
      if (response.success) {
        setSenderSchedule(response.schedules || []);
        setSenderRole(response.sender?.role || null);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setSenderSchedule([]);
      setSenderRole(null);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Hàm để mở modal từ chối
  const handleRejectClick = (request) => {
    setRequestToReject(request);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      
      // Chuẩn bị dữ liệu để gửi lên backend
      const approvalData = {
        pendingMakeupClasses: pendingMakeupClasses.map(makeup => ({
          absentScheduleId: makeup.absentScheduleId,
          makeupScheduleId: makeup.makeupScheduleId,
          makeupClassId: makeup.makeupClassId,
          // Gửi thông tin giáo viên dạy thay nếu có
          isSubstituteClass: makeup.isSubstituteClass || false,
          substituteTeacherId: makeup.substituteTeacherId || null
        })),
        pendingClassChange: pendingClassChange ? {
          oldClassId: pendingClassChange.oldClassId,
          newClassId: pendingClassChange.newClassId
        } : null
      };
      
      await academicStaffService.approveChangeRequest(selectedRequest._id, approvalData);
      setShowDetailModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      setSenderSchedule([]);
      setPendingClassChange(null);
      setPendingMakeupClasses([]);
      setPendingMakeupSessions([]);
      fetchChangeRequests(); // Refresh list
    } catch (err) {
      console.error('Error approving request:', err);
      alert(err.message || 'Có lỗi xảy ra khi chấp nhận đơn');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (rejectReasonParam = null) => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      await academicStaffService.rejectChangeRequest(selectedRequest._id, rejectReasonParam || rejectReason || null);
      setShowRejectModal(false);
      setRequestToReject(null);
      setRejectReason('');
      setShowDetailModal(false);
      setSelectedRequest(null);
      setSenderSchedule([]);
      setSenderRole(null);
      setPendingClassChange(null);
      setPendingMakeupClasses([]);
      setPendingMakeupSessions([]);
      fetchChangeRequests(); // Refresh list
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert(err.message || 'Có lỗi xảy ra khi từ chối đơn');
    } finally {
      setProcessing(false);
    }
  };

  // Hàm xử lý xóa buổi học bù
  const handleRemoveMakeupClass = (index) => {
    if (index < 0 || index >= pendingMakeupClasses.length) return;
    
    setPendingMakeupClasses(prev => {
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  // Hàm xử lý xóa thông tin đổi lớp
  const handleRemoveClassChange = () => {
    setPendingClassChange(null);
  };


  // Nếu đang hiển thị chi tiết đơn, render component RequestDetailPage
  if (showDetailModal && selectedRequest) {
    return (
      <>
        <RequestDetailPage
          selectedRequest={selectedRequest}
          senderSchedule={senderSchedule}
          senderRole={senderRole}
          loadingSchedule={loadingSchedule}
          pendingClassChange={pendingClassChange}
          pendingMakeupClasses={pendingMakeupClasses}
          pendingMakeupSessions={pendingMakeupSessions}
          onBack={() => {
            setShowDetailModal(false);
            setRejectReason('');
            setSelectedRequest(null);
            setSenderSchedule([]);
            setSenderRole(null);
            setPendingClassChange(null);
            setPendingMakeupClasses([]);
            setPendingMakeupSessions([]);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onChangeClass={handleChangeClassClick}
          onAddMakeupClass={(studentScheduleId) => {
            setShowMakeupClassModal(true);
            // Nếu có studentScheduleId từ đơn, tự động chọn buổi đó và set option
            if (studentScheduleId) {
              const scheduleIdStr = studentScheduleId.toString();
              setMakeupClassOption('existing'); // Tự động chọn option "existing" khi có studentScheduleId
              setSelectedCurrentScheduleId(scheduleIdStr);
              setShowAbsentScheduleList(false); // Ẩn danh sách khi có buổi từ đơn
            } else {
              setMakeupClassOption(null);
              setSelectedCurrentScheduleId(null);
              setShowAbsentScheduleList(true); // Hiện danh sách khi không có buổi từ đơn
            }
          }}
          onRemoveMakeupClass={handleRemoveMakeupClass}
          onRemoveClassChange={handleRemoveClassChange}
          processing={processing}
          formatDate={formatDate}
          renderClassInfo={renderClassInfo}
        />
        
        {/* Modal Đổi lớp */}
        <Modal show={showChangeClassModal} onHide={() => {
          setShowChangeClassModal(false);
          setSelectedClassToChange(null);
          setSelectedNewClassId(null);
          setSelectedNewClassInfo(null);
          setAvailableClasses([]);
        }} size="lg" centered>
          <Modal.Header closeButton className="pb-12">
            <Modal.Title className="text-16">Đổi lớp</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-16">
            {selectedClassToChange && (
              <div className="row g-3">
                {/* Cột trái: Lớp đang học */}
                <div className="col-md-6">
                  <div className="border border-primary rounded-8 p-12 bg-primary-25 h-100">
                    <h6 className="text-primary fw-bold mb-12 text-14">Lớp đang học</h6>
                    <div className="d-flex flex-column gap-2">
                      <div>
                        <small className="text-muted d-block mb-1">Tên lớp:</small>
                        <div className="fw-bold">{selectedClassToChange.className || 'N/A'}</div>
                      </div>
                      <div>
                        <small className="text-muted d-block mb-1">Tên khóa học:</small>
                        <div className="fw-bold">{selectedClassToChange.courseName || 'N/A'}</div>
                      </div>
                      <div>
                        <small className="text-muted d-block mb-1">Session đang học:</small>
                        <div className="fw-semibold">
                          {selectedClassToChange.currentSessionTitle || 'Chưa có session'}
                          {selectedClassToChange.currentSessionOrder !== null && (
                            <span className="text-neutral-500 ms-2">(Số thứ tự: {selectedClassToChange.currentSessionOrder})</span>
                          )}
                        </div>
                      </div>
                      <div style={{ minHeight: selectedClassToChange.roomName ? 'auto' : '60px' }}>
                        {selectedClassToChange.roomName && (
                          <div>
                            <small className="text-muted d-block mb-1">Phòng học:</small>
                            <div className="fw-semibold">{selectedClassToChange.roomName || 'N/A'}</div>
                          </div>
                        )}
                      </div>
                      {selectedClassToChange.fixedSchedules && selectedClassToChange.fixedSchedules.length > 0 ? (
                        <div>
                          <small className="text-muted d-block mb-1">Lịch học:</small>
                          <div className="border rounded-8 p-8 bg-white">
                            {(() => {
                              // Nhóm các buổi học theo thứ, startTime, endTime
                              const scheduleGroups = {};
                              selectedClassToChange.fixedSchedules.forEach(schedule => {
                                if (!schedule.date || !schedule.startTime || !schedule.endTime) return;
                                
                                const date = new Date(schedule.date);
                                const dayOfWeek = date.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
                                const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                const dayName = dayNames[dayOfWeek];
                                
                                // Format giờ: chuyển "08:00" thành "8h", "10:00" thành "10h"
                                const formatTime = (timeStr) => {
                                  if (!timeStr) return '';
                                  const [hours, minutes] = timeStr.split(':');
                                  const hourNum = parseInt(hours, 10);
                                  return hourNum + 'h';
                                };
                                const startTime = formatTime(schedule.startTime);
                                const endTime = formatTime(schedule.endTime);
                                
                                const key = `${dayOfWeek}-${schedule.startTime}-${schedule.endTime}`;
                                
                                if (!scheduleGroups[key]) {
                                  scheduleGroups[key] = {
                                    dayOfWeek,
                                    dayName,
                                    startTime: schedule.startTime,
                                    endTime: schedule.endTime,
                                    startTimeFormatted: startTime,
                                    endTimeFormatted: endTime
                                  };
                                }
                              });
                              
                              // Sắp xếp theo thứ trong tuần (Thứ 2 -> Thứ 7 -> Chủ nhật)
                              const sortedGroups = Object.values(scheduleGroups).sort((a, b) => {
                                // Sắp xếp: Thứ 2 (1) -> Thứ 7 (6) -> Chủ nhật (0)
                                const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                                const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                                if (orderA !== orderB) return orderA - orderB;
                                // Nếu cùng thứ, sắp xếp theo giờ bắt đầu
                                return a.startTime.localeCompare(b.startTime);
                              });
                              
                              return sortedGroups.map((group, index) => (
                                <div key={index} className="text-13 text-neutral-700 mb-1">
                                  {group.dayName} | {group.startTimeFormatted}-{group.endTimeFormatted}
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-neutral-500 text-13">Chưa có lịch học cố định</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cột phải: Lớp muốn đổi */}
                <div className="col-md-6">
                  <div className="border border-success rounded-8 p-12 bg-success-25 h-100">
                    <h6 className="text-success fw-bold mb-12 text-14">Lớp muốn đổi</h6>
                    <div className="d-flex flex-column gap-2">
                      <div>
                        <small className="text-muted d-block mb-1">Tên khóa học:</small>
                        <div className="fw-bold">{selectedClassToChange.courseName || 'N/A'}</div>
                      </div>
                      <div>
                        <small className="text-muted d-block mb-1">Chọn lớp:</small>
                        {loadingAvailableClasses ? (
                          <div className="text-center py-8">
                            <Spinner animation="border" size="sm" />
                            <p className="text-neutral-600 mt-4 text-12">Đang tải...</p>
                          </div>
                        ) : availableClasses.length === 0 ? (
                          <div className="text-neutral-500 text-13">Không có lớp nào khác cùng khóa học</div>
                        ) : (
                          <Form.Select
                            value={selectedNewClassId || ''}
                            onChange={(e) => setSelectedNewClassId(e.target.value)}
                            className="border-neutral-200"
                            size="sm"
                          >
                            <option value="">-- Chọn lớp --</option>
                            {availableClasses.map((cls) => {
                              const clsId = cls._id || cls;
                              const clsName = cls.name || 'N/A';
                              return (
                                <option key={clsId} value={clsId}>
                                  {clsName}
                                </option>
                              );
                            })}
                          </Form.Select>
                        )}
                      </div>

                      {selectedNewClassId && (
                        <>
                          {loadingNewClassInfo ? (
                            <div className="text-center py-8">
                              <Spinner animation="border" size="sm" />
                              <p className="text-neutral-600 mt-4 text-12">Đang tải thông tin lớp...</p>
                            </div>
                          ) : selectedNewClassInfo ? (
                            <>
                              <div>
                                <small className="text-muted d-block mb-1">Session đang học:</small>
                                <div className="fw-semibold">
                                  {selectedNewClassInfo.currentSessionTitle || 'Chưa có session'}
                                  {selectedNewClassInfo.currentSessionOrder !== null && (
                                    <span className="text-neutral-500 ms-2">(Số thứ tự: {selectedNewClassInfo.currentSessionOrder})</span>
                                  )}
                                </div>
                              </div>
                              <div style={{ minHeight: '60px' }}>
                                {((selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0) || (selectedNewClassInfo.studentCount !== null || selectedNewClassInfo.roomCapacity !== null)) && (
                                  <div className="d-flex justify-content-between align-items-start gap-3">
                                    {selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0 && (
                                      <div className="flex-fill">
                                        <small className="text-muted d-block mb-1">Phòng học:</small>
                                        <div className="fw-semibold">
                                          {selectedNewClassInfo.fixedSchedules[0]?.roomName || 'N/A'}
                                        </div>
                                      </div>
                                    )}
                                    {(selectedNewClassInfo.studentCount !== null || selectedNewClassInfo.roomCapacity !== null) && (
                                      <div className="flex-fill">
                                        <small className="text-muted d-block mb-1">Số lượng học sinh:</small>
                                        <div className="fw-semibold">
                                          {selectedNewClassInfo.studentCount !== null ? selectedNewClassInfo.studentCount : 'N/A'}
                                          {selectedNewClassInfo.roomCapacity !== null && (
                                            <span className="text-muted ms-2">/ {selectedNewClassInfo.roomCapacity}</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              {selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0 ? (
                                <div>
                                  <small className="text-muted d-block mb-1">Lịch học:</small>
                                  <div className="border rounded-8 p-8 bg-white">
                                    {(() => {
                                      // Nhóm các buổi học theo thứ, startTime, endTime
                                      const scheduleGroups = {};
                                      selectedNewClassInfo.fixedSchedules.forEach(schedule => {
                                        if (!schedule.date || !schedule.startTime || !schedule.endTime) return;
                                        
                                        const date = new Date(schedule.date);
                                        const dayOfWeek = date.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
                                        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                        const dayName = dayNames[dayOfWeek];
                                        
                                        // Format giờ: chuyển "08:00" thành "8h", "10:00" thành "10h"
                                        const formatTime = (timeStr) => {
                                          if (!timeStr) return '';
                                          const [hours, minutes] = timeStr.split(':');
                                          const hourNum = parseInt(hours, 10);
                                          return hourNum + 'h';
                                        };
                                        const startTime = formatTime(schedule.startTime);
                                        const endTime = formatTime(schedule.endTime);
                                        
                                        const key = `${dayOfWeek}-${schedule.startTime}-${schedule.endTime}`;
                                        
                                        if (!scheduleGroups[key]) {
                                          scheduleGroups[key] = {
                                            dayOfWeek,
                                            dayName,
                                            startTime: schedule.startTime,
                                            endTime: schedule.endTime,
                                            startTimeFormatted: startTime,
                                            endTimeFormatted: endTime
                                          };
                                        }
                                      });
                                      
                                      // Sắp xếp theo thứ trong tuần (Thứ 2 -> Thứ 7 -> Chủ nhật)
                                      const sortedGroups = Object.values(scheduleGroups).sort((a, b) => {
                                        // Sắp xếp: Thứ 2 (1) -> Thứ 7 (6) -> Chủ nhật (0)
                                        const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                                        const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                                        if (orderA !== orderB) return orderA - orderB;
                                        // Nếu cùng thứ, sắp xếp theo giờ bắt đầu
                                        return a.startTime.localeCompare(b.startTime);
                                      });
                                      
                                      return sortedGroups.map((group, index) => (
                                        <div key={index} className="text-13 text-neutral-700 mb-1">
                                          {group.dayName} | {group.startTimeFormatted}-{group.endTimeFormatted}
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-neutral-500 text-13">Chưa có lịch học cố định</div>
                              )}
                            </>
                          ) : (
                            <div className="text-neutral-500 text-13">Không tìm thấy thông tin lớp</div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowChangeClassModal(false);
                setSelectedClassToChange(null);
                setSelectedNewClassId(null);
                setSelectedNewClassInfo(null);
                setAvailableClasses([]);
              }}
            >
              Đóng
            </Button>
            <Button 
              variant="primary" 
              disabled={!selectedNewClassId || processing}
              onClick={() => {
                if (!selectedClassToChange || !selectedNewClassId || !selectedNewClassInfo) {
                  alert('Vui lòng chọn lớp muốn đổi');
                  return;
                }
                
                // Kiểm tra trường hợp 2: Lớp mới học nhanh hơn
                const oldSessionOrder = selectedClassToChange.currentSessionOrder;
                const newSessionOrder = selectedNewClassInfo.currentSessionOrder;
                const makeupSessions = [];
                
                if (oldSessionOrder !== null && newSessionOrder !== null && newSessionOrder > oldSessionOrder) {
                  // Tìm các sessions chưa học của lớp cũ có session order < newSessionOrder
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  const oldClassSchedules = senderSchedule.filter(sch => {
                    const classId = sch.class?._id?.toString() || sch.class?.toString();
                    return classId === selectedClassToChange.classId;
                  });
                  
                  oldClassSchedules.forEach(schedule => {
                    const scheduleDate = new Date(schedule.date);
                    scheduleDate.setHours(0, 0, 0, 0);
                    const sessionOrder = schedule.session?.order;
                    const attendanceStatus = schedule.attendance?.status;
                    
                    // Kiểm tra session chưa học và có order < newSessionOrder
                    if (sessionOrder !== null && sessionOrder !== undefined && 
                        sessionOrder < newSessionOrder &&
                        (scheduleDate > today || attendanceStatus === null || attendanceStatus === undefined)) {
                      makeupSessions.push({
                        sessionOrder: sessionOrder,
                        sessionTitle: schedule.session?.title || `Session ${sessionOrder}`,
                        date: schedule.date,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        classScheduleId: schedule._id || schedule.id
                      });
                    }
                  });
                  
                  // Sắp xếp theo session order
                  makeupSessions.sort((a, b) => a.sessionOrder - b.sessionOrder);
                }
                
                // Lưu thông tin đổi lớp vào state
                setPendingClassChange({
                  oldClassId: selectedClassToChange.classId,
                  newClassId: selectedNewClassId,
                  oldClassInfo: selectedClassToChange,
                  newClassInfo: selectedNewClassInfo
                });
                
                // Lưu danh sách sessions cần học bù
                setPendingMakeupSessions(makeupSessions);
                
                // Đóng modal đổi lớp
                setShowChangeClassModal(false);
                setSelectedClassToChange(null);
                setSelectedNewClassId(null);
                setSelectedNewClassInfo(null);
                setAvailableClasses([]);
                
                // Giữ modal chi tiết mở (nếu đang mở)
                // Nếu chưa mở thì không làm gì
              }}
            >
              {processing ? 'Đang xử lý...' : 'Xác nhận đổi lớp'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Thêm buổi học bù */}
        <Modal show={showMakeupClassModal} onHide={() => {
          setShowMakeupClassModal(false);
          setMakeupClassOption(null);
          setSelectedCurrentClassId(null);
          setSelectedCurrentClassInfo(null);
          setSelectedCurrentScheduleId(null);
          setSelectedMakeupClassId(null);
          setShowAbsentScheduleList(true);
          setSelectedMakeupClassInfo(null);
          setAvailableMakeupClasses([]);
          setConflictInfo(null);
          setPendingMakeupData(null);
          // Reset giáo viên dạy thay
          setSelectedSubstituteTeacherId(null);
        }} dialogClassName="modal-xl-custom" centered>
          <Modal.Header closeButton>
            <Modal.Title>{senderRole === 'Teacher' ? 'Xếp lịch dạy thay' : 'Thêm buổi học bù'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-16">
            {/* Hiển thị conflict nếu có */}
            {/* Chỉ hiển thị conflict ở trên khi chọn "existing" */}
            {makeupClassOption === 'existing' && validatingConflict && (
              <Alert variant="info" className="mb-16">
                <Spinner animation="border" size="sm" className="me-2" />
                Đang kiểm tra xung đột...
              </Alert>
            )}
            {makeupClassOption === 'existing' && !validatingConflict && conflictInfo && (
              (senderRole === 'Teacher' && conflictInfo.teacher?.length > 0) ||
              (senderRole !== 'Teacher' && conflictInfo.students && conflictInfo.students.length > 0)
            ) && (
              <Alert variant="warning" className="mb-16">
                <Alert.Heading>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Có xung đột lịch học
                </Alert.Heading>
                <div className="mt-12">
                  {senderRole === 'Teacher' ? (
                    // Hiển thị conflict cho giáo viên dạy thay
                    <>
                      {selectedCurrentScheduleId && (() => {
                        const selectedSchedule = filteredAbsentSchedules?.find(
                          s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
                        ) || calendarSchedules?.find(
                          s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
                        );
                        if (!selectedSchedule) return null;
                        
                        const selectedTeacher = availableSubstituteTeachers.find(
                          t => (t._id || t.id) === selectedSubstituteTeacherId
                        );
                        
                        return (
                          <div className="mb-12 p-8 bg-light rounded">
                            <strong>Buổi dạy thay bạn đang chọn:</strong>
                            <div className="mt-4">
                              • <strong>Giáo viên dạy thay:</strong> {selectedTeacher?.username || selectedTeacher?.fullName || selectedTeacher?.name || 'N/A'}<br/>
                              • <strong>Ngày:</strong> {selectedSchedule.date ? new Date(selectedSchedule.date).toLocaleDateString('vi-VN') : 'N/A'}<br/>
                              • <strong>Thời gian:</strong> {selectedSchedule.startTime || 'N/A'} - {selectedSchedule.endTime || 'N/A'}<br/>
                              • <strong>Phòng:</strong> {selectedSchedule.roomName || 'N/A'}
                            </div>
                          </div>
                        );
                      })()}
                      
                      {conflictInfo.teacher && conflictInfo.teacher.length > 0 && (
                        <div className="mb-8">
                          <strong className="text-danger">⚠️ Xung đột Giảng viên:</strong>
                          <p className="text-13 mb-2 mt-2">Giáo viên dạy thay đã có lớp khác vào cùng thời gian:</p>
                          <ul className="mb-0 mt-4">
                            {conflictInfo.teacher.map((c, idx) => (
                              <li key={idx}>
                                <strong>Lớp {c.className}</strong> - Ngày {c.date} - {c.time}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Không hiển thị conflict phòng cho giáo viên dạy thay vì buổi dạy thay diễn ra vào đúng phòng của buổi nghỉ (phòng đã trống) */}
                    </>
                  ) : (
                    // Hiển thị conflict cho học sinh (giữ nguyên)
                    <>
                      <div className="mb-12 p-8 bg-light rounded">
                        <strong>Buổi học bù bạn đang chọn:</strong>
                        <div className="mt-4">
                          {pendingMakeupData && pendingMakeupData.makeupSchedule && (() => {
                            const makeupSchedule = pendingMakeupData.makeupSchedule;
                            const makeupClassInfo = selectedMakeupClassInfo;
                            if (makeupSchedule) {
                              const scheduleDate = makeupSchedule.date ? new Date(makeupSchedule.date) : null;
                              const dateStr = scheduleDate ? scheduleDate.toLocaleDateString('vi-VN') : 'N/A';
                              return (
                                <div>
                                  • <strong>Lớp:</strong> {makeupClassInfo?.className || 'N/A'}<br/>
                                  • <strong>Ngày:</strong> {dateStr}<br/>
                                  • <strong>Thời gian:</strong> {makeupSchedule.startTime || 'N/A'} - {makeupSchedule.endTime || 'N/A'}<br/>
                                  • <strong>Phòng:</strong> {makeupSchedule.roomName || 'N/A'}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      
                      {conflictInfo.students && conflictInfo.students.length > 0 && (
                        <div className="mb-8">
                          <strong className="text-danger">⚠️ Xung đột Lịch học:</strong>
                          <p className="text-13 mb-2 mt-2">Học sinh đã có buổi học khác vào cùng thời gian với buổi học bù:</p>
                          <ul className="mb-0 mt-4">
                            {conflictInfo.students.map((studentConflict, idx) => (
                              <li key={idx}>
                                <strong>{studentConflict.studentName || 'Học sinh'}</strong>:
                                <ul className="mb-0 mt-2">
                                  {studentConflict.conflicts.map((c, cIdx) => (
                                    <li key={cIdx}>
                                      Lớp <strong>{c.className}</strong> - Ngày {c.date} - {c.time}
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-12 text-13 text-danger">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  <strong>Vui lòng chọn {senderRole === 'Teacher' ? 'giáo viên dạy thay khác' : 'buổi học bù khác'}</strong> - Không thể tiếp tục khi có xung đột lịch học.
                </div>
              </Alert>
            )}

            {/* Hiển thị nội dung khi đã chọn option */}
            {makeupClassOption === 'existing' && (
              <div className="row g-3 mt-16">
                {/* Cột trái: Buổi nghỉ - hiển thị cho cả existing và new */}
                <div className="col-md-6">
                  <div className="border border-primary rounded-8 p-12 bg-primary-25">
                    <div className="mb-12">
                      <h6 className="text-primary fw-bold mb-2 text-14">
                        Buổi nghỉ của {selectedRequest?.sender?.username || selectedRequest?.sender?.name || 'học viên'}
                      </h6>
                      {selectedCurrentClassInfo?.className && (
                        <small className="text-muted text-12">
                          Lớp: {selectedCurrentClassInfo.className}
                        </small>
                      )}
                      {!selectedCurrentClassInfo?.className && filteredAbsentSchedules && filteredAbsentSchedules.length > 0 && (
                        <small className="text-muted text-12">
                          {filteredAbsentSchedules[0].className ? `Lớp: ${filteredAbsentSchedules[0].className}` : 'Chọn buổi học để xem thông tin lớp'}
                        </small>
                      )}
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {/* Hiển thị thông tin buổi đã chọn ở trên cùng nếu có */}
                      {selectedCurrentScheduleId && (() => {
                        // Tìm trong filteredAbsentSchedules trước
                        let selectedSchedule = filteredAbsentSchedules?.find(
                          s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
                        );
                        
                        // Nếu không tìm thấy, tìm trong calendarSchedules
                        if (!selectedSchedule) {
                          selectedSchedule = calendarSchedules?.find(
                            s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
                          );
                        }
                        
                        // Nếu vẫn không tìm thấy, lấy trực tiếp từ selectedRequest.studentScheduleId (đã được populate)
                        if (!selectedSchedule && selectedRequest && selectedRequest.studentScheduleId) {
                          const studentSchedule = selectedRequest.studentScheduleId;
                          const studentScheduleId = (studentSchedule._id || studentSchedule.id)?.toString();
                          const targetId = selectedCurrentScheduleId.toString();
                          
                            // Kiểm tra xem có khớp với selectedCurrentScheduleId không
                            if (studentScheduleId === targetId) {
                              const classSchedule = studentSchedule.classSchedule;
                              
                              if (classSchedule) {
                              const scheduleDate = classSchedule.date ? new Date(classSchedule.date) : null;
                              const dateStr = scheduleDate ? formatDateToYYYYMMDD(scheduleDate) : null;
                              
                              selectedSchedule = {
                                id: studentSchedule._id || studentSchedule.id,
                                _id: studentSchedule._id || studentSchedule.id,
                                title: classSchedule.session?.title || classSchedule.topic || 'N/A',
                                order: classSchedule.session?.order || null,
                                date: dateStr || classSchedule.date,
                                startTime: classSchedule.startTime || '',
                                endTime: classSchedule.endTime || '',
                                roomName: classSchedule.room?.room_name || 'N/A',
                                className: classSchedule.class?.name || 'N/A',
                                courseName: classSchedule.class?.course?.name || 'N/A',
                                scheduleStatus: studentSchedule.scheduleStatus || 'scheduled'
                              };
                            }
                          }
                        }
                        
                        // Nếu vẫn không tìm thấy, tìm trực tiếp trong senderSchedule
                        if (!selectedSchedule && senderSchedule && senderSchedule.length > 0) {
                          // Tìm theo studentSchedule._id trước
                          let originalSchedule = senderSchedule.find(
                            s => {
                              const scheduleId = (s._id || s.id)?.toString();
                              const targetId = selectedCurrentScheduleId.toString();
                              return scheduleId === targetId;
                            }
                          );
                          
                          // Nếu không tìm thấy, tìm theo classSchedule._id
                          if (!originalSchedule) {
                            originalSchedule = senderSchedule.find(
                              s => {
                                const classScheduleId = (s.classSchedule?._id || s.classSchedule?.id)?.toString();
                                const targetId = selectedCurrentScheduleId.toString();
                                return classScheduleId === targetId;
                              }
                            );
                          }
                          
                          if (originalSchedule) {
                            // Lấy thông tin từ classSchedule nếu có, nếu không thì từ chính nó
                            const classSchedule = originalSchedule.classSchedule || originalSchedule;
                            const scheduleDate = classSchedule.date ? new Date(classSchedule.date) : null;
                            const dateStr = scheduleDate ? formatDateToYYYYMMDD(scheduleDate) : null;
                            
                            selectedSchedule = {
                              id: originalSchedule._id || originalSchedule.id,
                              _id: originalSchedule._id || originalSchedule.id,
                              title: classSchedule.session?.title || classSchedule.topic || originalSchedule.topic || 'N/A',
                              order: classSchedule.session?.order || null,
                              date: dateStr || classSchedule.date || originalSchedule.date,
                              startTime: classSchedule.startTime || originalSchedule.startTime || '',
                              endTime: classSchedule.endTime || originalSchedule.endTime || '',
                              roomName: classSchedule.room?.room_name || originalSchedule.room?.room_name || 'N/A',
                              className: classSchedule.class?.name || originalSchedule.class?.name || 'N/A',
                              courseName: classSchedule.class?.course?.name || originalSchedule.class?.course?.name || 'N/A',
                              scheduleStatus: originalSchedule.scheduleStatus || 'scheduled'
                            };
                          }
                        }
                        
                        if (!selectedSchedule) {
                          return null;
                        }
                        
                        return (
                          <div className="mb-12">
                            <div className="mb-8">
                              <h6 className="text-primary fw-bold mb-0 text-13">Thông tin buổi nghỉ đã chọn</h6>
                            </div>
                            <div className="border border-primary rounded-8 p-12 bg-white">
                              <div className="row g-2 text-12">
                                <div className="col-12">
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="fas fa-book text-primary"></i>
                                    <span className="text-muted">Buổi học:</span>
                                    <span className="fw-semibold">{selectedSchedule.title || 'N/A'}</span>
                                    {selectedSchedule.order !== null && (
                                      <span className="text-neutral-500">(STT: {selectedSchedule.order})</span>
                                    )}
                                  </div>
                                </div>
                                {selectedSchedule.date && (
                                  <div className="col-6">
                                    <div className="d-flex align-items-center gap-2">
                                      <i className="fas fa-calendar-alt text-primary"></i>
                                      <span className="text-muted">Ngày:</span>
                                      <span className="fw-semibold">{new Date(selectedSchedule.date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                  </div>
                                )}
                                <div className="col-6">
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="fas fa-clock text-primary"></i>
                                    <span className="text-muted">Giờ:</span>
                                    <span className="fw-semibold">{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                                  </div>
                                </div>
                                {selectedSchedule.roomName && (
                                  <div className="col-6">
                                    <div className="d-flex align-items-center gap-2">
                                      <i className="fas fa-door-open text-primary"></i>
                                      <span className="text-muted">Phòng:</span>
                                      <span className="fw-semibold">{selectedSchedule.roomName || 'N/A'}</span>
                                    </div>
                                  </div>
                                )}
                                {selectedSchedule.className && (
                                  <div className="col-6">
                                    <div className="d-flex align-items-center gap-2">
                                      <i className="fas fa-users text-primary"></i>
                                      <span className="text-muted">Lớp:</span>
                                      <span className="fw-semibold text-truncate">{selectedSchedule.className || 'N/A'}</span>
                                    </div>
                                  </div>
                                )}
                                {selectedSchedule.courseName && (
                                  <div className="col-12">
                                    <div className="d-flex align-items-center gap-2">
                                      <i className="fas fa-graduation-cap text-primary"></i>
                                      <span className="text-muted">Khóa học:</span>
                                      <span className="fw-semibold text-truncate">{selectedSchedule.courseName || 'N/A'}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Danh sách buổi học - chỉ hiển thị khi không có selectedCurrentScheduleId từ đơn */}
                      {!selectedCurrentScheduleId && (
                        <div>
                          <div className="mb-1">
                            <small className="text-muted d-block">Chọn buổi học:</small>
                          </div>
                          {loadingCurrentClassInfo ? (
                            <div className="text-center py-8">
                              <Spinner animation="border" size="sm" />
                              <p className="text-neutral-600 mt-4 text-12">Đang tải thông tin...</p>
                            </div>
                          ) : filteredAbsentSchedules && filteredAbsentSchedules.length > 0 ? (
                            <div className="row g-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                              {filteredAbsentSchedules.map((schedule) => {
                              const scheduleId = schedule.id || schedule._id;
                              const dateStr = schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : '';
                              const timeStr = `${schedule.startTime} - ${schedule.endTime}`;
                              const isSelected = selectedCurrentScheduleId === scheduleId.toString();
                              const isCancelled = schedule.scheduleStatus === 'cancelled';
                              const isMakeupSchedule = schedule.isMakeupSchedule || schedule.scheduleStatus === 'rescheduled';
                              return (
                                <div key={scheduleId} className="col-12 col-md-4">
                                  <div
                                    onClick={() => {
                                      if (!isCancelled) {
                                        setSelectedCurrentScheduleId(scheduleId.toString());
                                      }
                                    }}
                                    className={`border rounded-8 p-8 transition-all ${
                                      isCancelled
                                        ? 'border-danger bg-danger-25 opacity-75'
                                        : isMakeupSchedule
                                        ? isSelected
                                          ? 'border-success bg-success-25 shadow-sm cursor-pointer'
                                          : 'border-success bg-white cursor-pointer'
                                        : isSelected
                                        ? 'border-primary bg-primary-25 shadow-sm cursor-pointer'
                                        : 'border-neutral-200 bg-white cursor-pointer'
                                    }`}
                                    style={{ 
                                      cursor: isCancelled ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isSelected && !isCancelled) {
                                        if (isMakeupSchedule) {
                                          e.currentTarget.style.borderColor = 'var(--bs-success, #198754)';
                                          e.currentTarget.style.backgroundColor = 'rgba(25, 135, 84, 0.15)';
                                        } else {
                                          e.currentTarget.style.borderColor = 'var(--bs-primary, #0d6efd)';
                                          e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                                        }
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isSelected && !isCancelled) {
                                        e.currentTarget.style.borderColor = '';
                                        e.currentTarget.style.backgroundColor = '';
                                      }
                                    }}
                                  >
                                    <div className="d-flex align-items-start gap-2">
                                      <div className={`flex-shrink-0 mt-1 ${
                                        isCancelled 
                                          ? 'text-danger' 
                                          : isMakeupSchedule
                                          ? isSelected
                                            ? 'text-success'
                                            : 'text-success'
                                          : isSelected 
                                          ? 'text-primary' 
                                          : 'text-neutral-400'
                                      }`}>
                                        <i className={`fas ${
                                          isCancelled 
                                            ? 'fa-times-circle' 
                                            : isMakeupSchedule
                                            ? isSelected
                                              ? 'fa-check-circle'
                                              : 'fa-redo'
                                            : isSelected 
                                            ? 'fa-check-circle' 
                                            : 'fa-circle'
                                        }`}></i>
                                      </div>
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                          <div className={`fw-semibold text-13 ${
                                            isCancelled 
                                              ? 'text-danger' 
                                              : isMakeupSchedule
                                              ? 'text-success'
                                              : isSelected 
                                              ? 'text-primary' 
                                              : 'text-neutral-800'
                                          }`}>
                                            {schedule.title || 'N/A'}
                                          </div>
                                          <div className="d-flex gap-1">
                                            {isMakeupSchedule && !isCancelled && (
                                              <Badge bg="success" className="text-11">
                                                Buổi học bù
                                              </Badge>
                                            )}
                                            {isCancelled && (
                                              <Badge bg="danger" className="text-11">
                                                Đã hủy
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        {dateStr && (
                                          <div className={`text-12 mb-1 ${
                                            isCancelled 
                                              ? 'text-danger' 
                                              : isMakeupSchedule 
                                              ? 'text-success' 
                                              : 'text-neutral-600'
                                          }`}>
                                            <i className="fas fa-calendar-alt me-1"></i>
                                            {dateStr}
                                          </div>
                                        )}
                                        <div className={`text-12 ${
                                          isCancelled 
                                            ? 'text-danger' 
                                            : isMakeupSchedule 
                                            ? 'text-success' 
                                            : 'text-neutral-600'
                                        }`}>
                                          <i className="fas fa-clock me-1"></i>
                                          {timeStr}
                                        </div>
                                        {schedule.roomName && (
                                          <div className={`text-11 mt-1 ${
                                            isCancelled 
                                              ? 'text-danger' 
                                              : isMakeupSchedule 
                                              ? 'text-success' 
                                              : 'text-neutral-500'
                                          }`}>
                                            <i className="fas fa-door-open me-1"></i>
                                            {schedule.roomName}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          ) : (
                            <div className="text-neutral-500 text-13">
                              {calendarSchedules && calendarSchedules.length > 0
                                ? 'Tất cả buổi học đã được chọn'
                                : 'Không có buổi học'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cột phải: Buổi học bù / Giáo viên dạy thay */}
                {makeupClassOption === 'existing' && (
                  <div className="col-md-6">
                  <div className="border border-success rounded-8 p-12 bg-success-25">
                    <h6 className="text-success fw-bold mb-12 text-14">
                      {senderRole === 'Teacher' ? 'Giáo viên dạy thay' : 'Buổi học bù'}
                    </h6>
                    <div className="d-flex flex-column gap-2">
                      {senderRole === 'Teacher' ? (
                        // UI cho giáo viên dạy thay
                        <>
                          <div>
                            <small className="text-muted d-block mb-1">Chọn giáo viên dạy thay:</small>
                            {loadingSubstituteTeachers ? (
                              <div className="text-center py-8">
                                <Spinner animation="border" size="sm" />
                                <p className="text-neutral-600 mt-4 text-12">Đang tải...</p>
                              </div>
                            ) : !availableSubstituteTeachers || availableSubstituteTeachers.length === 0 ? (
                              <div className="text-neutral-500 text-13">Không có giáo viên nào</div>
                            ) : (
                              <Form.Select
                                value={selectedSubstituteTeacherId || ''}
                                onChange={(e) => {
                                  setSelectedSubstituteTeacherId(e.target.value);
                                }}
                                className="border-neutral-200"
                                size="sm"
                              >
                                <option value="">-- Chọn giáo viên --</option>
                                {availableSubstituteTeachers.map((teacher) => {
                                  const teacherId = teacher._id || teacher.id;
                                  const teacherName = teacher.username || teacher.fullName || teacher.name || 'N/A';
                                  return (
                                    <option key={teacherId} value={teacherId}>
                                      {teacherName}
                                    </option>
                                  );
                                })}
                              </Form.Select>
                            )}
                          </div>
                          {selectedSubstituteTeacherId && selectedCurrentScheduleId && (
                            <>
                              {(() => {
                                const selectedTeacher = availableSubstituteTeachers.find(
                                  t => (t._id || t.id) === selectedSubstituteTeacherId
                                );
                                const selectedSchedule = filteredAbsentSchedules?.find(
                                  s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
                                ) || calendarSchedules?.find(
                                  s => (s.id || s._id)?.toString() === selectedCurrentScheduleId.toString()
                                );
                                
                                if (!selectedSchedule) return null;
                                
                                return (
                                  <div className="mt-12">
                                    <div className="border-top border-neutral-300 pt-12">
                                      <h6 className="text-success fw-bold mb-8 text-13">Thông tin buổi dạy thay</h6>
                                      <div className="row g-2 text-12">
                                        <div className="col-12">
                                          <div className="d-flex align-items-center gap-2">
                                            <i className="fas fa-user-tie text-success"></i>
                                            <span className="text-muted">Giáo viên dạy thay:</span>
                                            <span className="fw-semibold">{selectedTeacher?.username || selectedTeacher?.fullName || selectedTeacher?.name || 'N/A'}</span>
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="d-flex align-items-center gap-2">
                                            <i className="fas fa-book text-success"></i>
                                            <span className="text-muted">Buổi học:</span>
                                            <span className="fw-semibold">{selectedSchedule.title || 'N/A'}</span>
                                            {selectedSchedule.order !== null && (
                                              <span className="text-neutral-500">(STT: {selectedSchedule.order})</span>
                                            )}
                                          </div>
                                        </div>
                                        {selectedSchedule.date && (
                                          <div className="col-6">
                                            <div className="d-flex align-items-center gap-2">
                                              <i className="fas fa-calendar-alt text-success"></i>
                                              <span className="text-muted">Ngày:</span>
                                              <span className="fw-semibold">{new Date(selectedSchedule.date).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                          </div>
                                        )}
                                        <div className="col-6">
                                          <div className="d-flex align-items-center gap-2">
                                            <i className="fas fa-clock text-success"></i>
                                            <span className="text-muted">Giờ:</span>
                                            <span className="fw-semibold">{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                                          </div>
                                        </div>
                                        {selectedSchedule.roomName && (
                                          <div className="col-6">
                                            <div className="d-flex align-items-center gap-2">
                                              <i className="fas fa-door-open text-success"></i>
                                              <span className="text-muted">Phòng:</span>
                                              <span className="fw-semibold">{selectedSchedule.roomName || 'N/A'}</span>
                                            </div>
                                          </div>
                                        )}
                                        {selectedSchedule.className && (
                                          <div className="col-6">
                                            <div className="d-flex align-items-center gap-2">
                                              <i className="fas fa-users text-success"></i>
                                              <span className="text-muted">Lớp:</span>
                                              <span className="fw-semibold text-truncate">{selectedSchedule.className || 'N/A'}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </>
                          )}
                        </>
                      ) : (
                        // UI cho học sinh (giữ nguyên)
                        <>
                          {selectedCurrentClassInfo && (
                            <div>
                              <small className="text-muted d-block mb-1">Tên khóa học:</small>
                              <div className="fw-bold">{selectedCurrentClassInfo.courseName || 'N/A'}</div>
                            </div>
                          )}
                          
                          {/* Hiển thị danh sách ClassSchedule có cùng session từ API */}
                          {selectedCurrentScheduleId && (
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">Chọn buổi học bù:</small>
                              {loadingClassSchedulesBySession ? (
                                <div className="text-center py-8">
                                  <Spinner animation="border" size="sm" />
                                  <p className="text-neutral-600 mt-4 text-12">Đang tải...</p>
                                </div>
                              ) : availableClassSchedulesBySession && availableClassSchedulesBySession.length > 0 ? (() => {
                                // Filter các ClassSchedule không có conflict với lịch học của sinh viên
                                const filteredClassSchedules = availableClassSchedulesBySession.filter(schedule => {
                                  // Nếu không có senderSchedule, không filter
                                  if (!senderSchedule || senderSchedule.length === 0) {
                                    return true;
                                  }
                                  
                                  // Kiểm tra conflict với lịch học của sinh viên
                                  // Nếu có đổi lớp, check với lịch lớp mới; nếu không, check với lịch hiện tại
                                  const scheduleToCheck = pendingClassChange && pendingClassChange.newClassId 
                                    ? newClassSchedule 
                                    : senderSchedule;
                                  
                                  // Format schedule để check conflict
                                  const scheduleForCheck = {
                                    date: schedule.date,
                                    startTime: schedule.startTime,
                                    endTime: schedule.endTime
                                  };
                                  
                                  // Bỏ qua buổi nghỉ hiện tại
                                  const scheduleId = (schedule._id || schedule.id)?.toString();
                                  if (scheduleId && selectedCurrentScheduleId && scheduleId === selectedCurrentScheduleId.toString()) {
                                    return false;
                                  }
                                  
                                  // Check conflict
                                  return !checkScheduleConflict(scheduleForCheck, scheduleToCheck, selectedCurrentScheduleId);
                                });
                                
                                if (filteredClassSchedules.length === 0) {
                                  return (
                                    <div className="text-neutral-500 text-13">
                                      Không có buổi học bù phù hợp (tất cả đều conflict với lịch học hiện tại)
                                    </div>
                                  );
                                }
                                
                                return (
                                  <Form.Select
                                    value={selectedMakeupClassInfo?.selectedScheduleId || ''}
                                    onChange={async (e) => {
                                      const selectedScheduleId = e.target.value;
                                      if (selectedScheduleId) {
                                        const selectedSchedule = filteredClassSchedules.find(
                                          s => (s._id || s.id)?.toString() === selectedScheduleId
                                        );
                                        if (selectedSchedule) {
                                          // Validate conflict với API trước khi set
                                          if (selectedRequest && selectedRequest.sender && senderRole !== 'Teacher') {
                                            try {
                                              const studentId = selectedRequest.sender._id || selectedRequest.sender;
                                              const validateResponse = await classScheduleService.validateMakeupClassSchedule(
                                                selectedScheduleId,
                                                studentId
                                              );
                                              
                                              if (validateResponse.success && validateResponse.hasConflict && validateResponse.conflicts && validateResponse.conflicts.length > 0) {
                                                // Có conflict, hiển thị thông báo nhưng vẫn cho phép chọn
                                                const conflictInfo = {
                                                  students: [{
                                                    studentName: selectedRequest.sender?.username || 'Học sinh',
                                                    conflicts: validateResponse.conflicts
                                                  }]
                                                };
                                                setConflictInfo(conflictInfo);
                                              } else {
                                                // Không có conflict
                                                setConflictInfo(null);
                                              }
                                            } catch (error) {
                                              console.error('Error validating makeup class schedule:', error);
                                              // Vẫn cho phép chọn nếu validate lỗi
                                            }
                                          }
                                          
                                          // Tạo selectedMakeupClassInfo từ ClassSchedule được chọn
                                          setSelectedMakeupClassInfo({
                                            className: selectedSchedule.class?.name || 'N/A',
                                            courseName: selectedSchedule.class?.course?.name || 'N/A',
                                            selectedScheduleId: selectedScheduleId,
                                            fixedSchedules: [{
                                              id: selectedSchedule._id || selectedSchedule.id,
                                              _id: selectedSchedule._id || selectedSchedule.id,
                                              title: selectedSchedule.session?.title || 'N/A',
                                              order: selectedSchedule.session?.order || null,
                                              date: selectedSchedule.date,
                                              startTime: selectedSchedule.startTime,
                                              endTime: selectedSchedule.endTime,
                                              roomName: selectedSchedule.room?.room_name || 'N/A'
                                            }]
                                          });
                                          setSelectedMakeupClassId(selectedSchedule.class?._id || selectedSchedule.class);
                                        }
                                      } else {
                                        setSelectedMakeupClassInfo(null);
                                        setSelectedMakeupClassId(null);
                                        setConflictInfo(null);
                                      }
                                    }}
                                    className="border-neutral-200"
                                    size="sm"
                                  >
                                    <option value="">-- Chọn buổi học bù --</option>
                                    {filteredClassSchedules.map((schedule) => {
                                      const scheduleId = (schedule._id || schedule.id)?.toString();
                                      const dateStr = schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : '';
                                      const timeStr = `${schedule.startTime || ''} - ${schedule.endTime || ''}`;
                                      const className = schedule.class?.name || 'N/A';
                                      const displayText = `${schedule.session?.title || 'N/A'} - ${className}${dateStr ? ` (${dateStr})` : ''} - ${timeStr}`;
                                      return (
                                        <option key={scheduleId} value={scheduleId}>
                                          {displayText}
                                        </option>
                                      );
                                    })}
                                  </Form.Select>
                                );
                              })() : (
                                <div className="text-neutral-500 text-13">
                                  Không có buổi học bù phù hợp. Vui lòng thử lại sau.
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Hiển thị thông tin chi tiết của buổi học bù đã chọn */}
                          {selectedMakeupClassInfo?.selectedScheduleId && (
                            <div className="mt-3">
                              {(() => {
                                // Tìm selectedSchedule từ availableClassSchedulesBySession
                                let selectedSchedule = null;
                                
                                if (availableClassSchedulesBySession && availableClassSchedulesBySession.length > 0) {
                                  selectedSchedule = availableClassSchedulesBySession.find(
                                    s => (s._id || s.id)?.toString() === selectedMakeupClassInfo.selectedScheduleId?.toString()
                                  );
                                  
                                  if (selectedSchedule) {
                                    // Format selectedSchedule để hiển thị
                                    selectedSchedule = {
                                      id: selectedSchedule._id || selectedSchedule.id,
                                      _id: selectedSchedule._id || selectedSchedule.id,
                                      title: selectedSchedule.session?.title || 'N/A',
                                      order: selectedSchedule.session?.order || null,
                                      date: selectedSchedule.date,
                                      startTime: selectedSchedule.startTime,
                                      endTime: selectedSchedule.endTime,
                                      roomName: selectedSchedule.room?.room_name || 'N/A',
                                      className: selectedSchedule.class?.name || 'N/A',
                                      courseName: selectedSchedule.class?.course?.name || 'N/A'
                                    };
                                  }
                                }
                                
                                // Nếu không tìm thấy, tìm trong fixedSchedules
                                if (!selectedSchedule && selectedMakeupClassInfo.fixedSchedules) {
                                  selectedSchedule = selectedMakeupClassInfo.fixedSchedules.find(
                                    s => (s.id || s._id)?.toString() === selectedMakeupClassInfo.selectedScheduleId?.toString()
                                  );
                                }
                                
                                if (!selectedSchedule) return null;
                                
                                return (
                                  <>
                                    <div>
                                      <small className="text-muted d-block mb-1">Buổi học:</small>
                                      <div className="fw-semibold">
                                        {selectedSchedule.title || 'N/A'}
                                        {selectedSchedule.order !== null && (
                                          <span className="text-neutral-500 ms-2">(Số thứ tự: {selectedSchedule.order})</span>
                                        )}
                                      </div>
                                    </div>
                                    {selectedSchedule.date && (
                                      <div>
                                        <small className="text-muted d-block mb-1">Ngày học:</small>
                                        <div className="fw-semibold">
                                          {new Date(selectedSchedule.date).toLocaleDateString('vi-VN')}
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <small className="text-muted d-block mb-1">Thời gian:</small>
                                      <div className="fw-semibold">
                                        {selectedSchedule.startTime} - {selectedSchedule.endTime}
                                      </div>
                                    </div>
                                    {selectedSchedule.roomName && (
                                      <div>
                                        <small className="text-muted d-block mb-1">Phòng học:</small>
                                        <div className="fw-semibold">
                                          {selectedSchedule.roomName || 'N/A'}
                                        </div>
                                      </div>
                                    )}
                                    {selectedSchedule.className && (
                                      <div>
                                        <small className="text-muted d-block mb-1">Lớp:</small>
                                        <div className="fw-semibold">
                                          {selectedSchedule.className || 'N/A'}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={resetMakeupModalState}
            >
              Đóng
            </Button>
              <Button 
                variant="primary" 
                disabled={
                  processing || 
                  validatingConflict ||
                  (senderRole === 'Teacher' 
                    ? (!selectedCurrentScheduleId || !selectedSubstituteTeacherId || (conflictInfo && conflictInfo.teacher?.length > 0))
                    : (!selectedCurrentScheduleId || !selectedMakeupClassInfo?.selectedScheduleId || (conflictInfo && conflictInfo.students && conflictInfo.students.length > 0)))
                }
              onClick={handleSaveMakeupClass}
            >
              {processing ? 'Đang xử lý...' : 'Lưu'}
              </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AcademicNavigation />
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <Container fluid className="p-24">
          {/* Header */}
          <div className="mb-24">
            <h4 className="text-neutral-900 fw-bold mb-8">Quản lý đơn</h4>
            <p className="text-neutral-600 mb-0">Quản lý đơn xin đổi buổi/lớp học từ học viên và giảng viên</p>
          </div>

          {/* Summary Card */}
          <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-20">
              <div className="d-flex gap-24">
                <div>
                  <p className="text-neutral-600 text-12 mb-4">Tổng số đơn</p>
                  <h3 className="text-neutral-900 fw-bold mb-0">{total}</h3>
                </div>
                <div>
                  <p className="text-neutral-600 text-12 mb-4">Chờ duyệt</p>
                  <h3 className="text-warning fw-bold mb-0">{stats.pending}</h3>
                </div>
                <div>
                  <p className="text-neutral-600 text-12 mb-4">Đã duyệt</p>
                  <h3 className="text-success fw-bold mb-0">{stats.approved}</h3>
                </div>
                <div>
                  <p className="text-neutral-600 text-12 mb-4">Từ chối</p>
                  <h3 className="text-danger fw-bold mb-0">{stats.rejected}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Filters and Search */}
          <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
            <Card.Body className="p-20">
              <Row className="g-3 align-items-center">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text className="bg-neutral-50 border-neutral-200">
                      <i className="fas fa-search text-neutral-600"></i>
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Tìm theo nội dung đơn hoặc người gửi..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1); // Reset về trang 1 khi search
                      }}
                      className="border-neutral-200"
                    />
                  </InputGroup>
                </Col>

                <Col md={2}>
                  <Form.Select 
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(1); // Reset về trang 1 khi filter
                    }}
                    className="border-neutral-200"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Select 
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setPage(1); // Reset về trang 1 khi filter
                    }}
                    className="border-neutral-200"
                  >
                    <option value="all">Tất cả loại đơn</option>
                    <option value="create_class">Tạo lớp</option>
                    <option value="change_class">Đổi lớp</option>
                    <option value="makeup_class">Học bù</option>
                    <option value="replace_teacher">Thay giáo viên</option>
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border-neutral-200"
                  >
                    <option value="oldest">Cũ nhất trước</option>
                    <option value="newest">Mới nhất trước</option>
                    <option value="sender">Theo người gửi (A-Z)</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Loading */}
          {loading && (
            <div className="text-center py-40">
              <Spinner animation="border" variant="primary" />
              <p className="text-neutral-600 mt-16">Đang tải danh sách đơn...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="danger" className="mb-24">
              <Alert.Heading>Lỗi</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          {/* Table */}
          {!loading && !error && (
            <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead>
                    <tr className="bg-neutral-25">
                      <th 
                        className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          if (sortBy === 'sender') {
                            setSortBy('sender-desc');
                          } else {
                            setSortBy('sender');
                          }
                        }}
                      >
                        Người gửi
                        {sortBy === 'sender' && <span className="ms-2">↑</span>}
                        {sortBy === 'sender-desc' && <span className="ms-2">↓</span>}
                      </th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Loại đơn</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Nội dung</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Ngày gửi</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Người duyệt</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Ngày duyệt</th>
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changeRequests.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-40 text-neutral-500">
                          Không có đơn nào
                        </td>
                      </tr>
                    ) : (
                      changeRequests.map((request) => (
                        <tr key={request._id}>
                          <td className="px-20 py-16">
                            <div>
                              <div className="text-neutral-900 fw-medium">{request.sender?.username || '-'}</div>
                              <div className="text-neutral-600 text-12">{request.sender?.email || '-'}</div>
                            </div>
                          </td>
                          <td className="px-20 py-16">
                            {getTypeBadge(request.type)}
                          </td>
                          <td className="px-20 py-16">
                            <div className="text-neutral-700" style={{ maxWidth: '300px' }}>
                              {request.content}
                            </div>
                          </td>
                          <td className="px-20 py-16 text-neutral-600 text-13">
                            {formatDate(request.createdAt)}
                          </td>
                          <td className="px-20 py-16">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-20 py-16 text-neutral-600 text-13">
                            {request.approver?.username || '-'}
                          </td>
                          <td className="px-20 py-16 text-neutral-600 text-13">
                            {formatDate(request.approvedDate)}
                          </td>
                          <td className="px-20 py-16">
                            {request.status === 'pending' ? (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveClick(request);
                                }}
                                disabled={processing}
                              >
                                Xem chi tiết
                              </Button>
                            ) : (
                              <span className="text-neutral-500 text-13">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
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
                  <div className="text-center mt-12 text-neutral-600 text-12">
                    Trang {page} / {totalPages} ({total} đơn)
                  </div>
                </Card.Footer>
              )}
            </Card>
          )}


          {/* Reject Modal */}
          <Modal show={showRejectModal} onHide={() => {
            setShowRejectModal(false);
            setRequestToReject(null);
            setRejectReason('');
          }} centered>
            <Modal.Header closeButton>
              <Modal.Title>Từ chối đơn</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {requestToReject && (
                <div className="mb-16">
                  <p className="text-neutral-700 mb-8">
                    <strong>Người gửi:</strong> {requestToReject.sender?.username} ({requestToReject.sender?.email})
                  </p>
                  <p className="text-neutral-700 mb-8">
                    <strong>Ngày gửi:</strong> {formatDate(requestToReject.createdAt)}
                  </p>
                  <p className="text-neutral-700 mb-16">
                    <strong>Nội dung đơn:</strong> {requestToReject.content}
                  </p>
                </div>
              )}
              <Form.Group>
                <Form.Label>Lý do từ chối (không bắt buộc)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối (nếu có)..."
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowRejectModal(false);
                  setRequestToReject(null);
                  setRejectReason('');
                }}
                disabled={processing}
              >
                Hủy
              </Button>
              <Button 
                variant="danger" 
                onClick={handleReject} 
                disabled={processing}
              >
                {processing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal Đổi lớp */}
          <Modal show={showChangeClassModal} onHide={() => {
            setShowChangeClassModal(false);
            setSelectedClassToChange(null);
            setSelectedNewClassId(null);
            setSelectedNewClassInfo(null);
            setAvailableClasses([]);
          }} size="lg" centered>
            <Modal.Header closeButton className="pb-12">
              <Modal.Title className="text-16">Đổi lớp</Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-16">
              {selectedClassToChange && (
                <div className="row g-3">
                  {/* Cột trái: Lớp đang học */}
                  <div className="col-md-6">
                    <div className="border border-primary rounded-8 p-12 bg-primary-25 h-100">
                      <h6 className="text-primary fw-bold mb-12 text-14">Lớp đang học</h6>
                      <div className="d-flex flex-column gap-2">
                        <div>
                          <small className="text-muted d-block mb-1">Tên lớp:</small>
                          <div className="fw-bold">{selectedClassToChange.className || 'N/A'}</div>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Tên khóa học:</small>
                          <div className="fw-bold">{selectedClassToChange.courseName || 'N/A'}</div>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Session đang học:</small>
                          <div className="fw-semibold">
                            {selectedClassToChange.currentSessionTitle || 'Chưa có session'}
                            {selectedClassToChange.currentSessionOrder !== null && (
                              <span className="text-neutral-500 ms-2">(Số thứ tự: {selectedClassToChange.currentSessionOrder})</span>
                            )}
                          </div>
                        </div>
                        {selectedClassToChange.roomName && (
                          <div>
                            <small className="text-muted d-block mb-1">Phòng học:</small>
                            <div className="fw-semibold">{selectedClassToChange.roomName || 'N/A'}</div>
                          </div>
                        )}
                        {selectedClassToChange.fixedSchedules && selectedClassToChange.fixedSchedules.length > 0 ? (
                          <div>
                            <small className="text-muted d-block mb-1">Lịch học:</small>
                            <div className="border rounded-8 p-8 bg-white">
                              {(() => {
                                // Nhóm các buổi học theo thứ, startTime, endTime
                                const scheduleGroups = {};
                                selectedClassToChange.fixedSchedules.forEach(schedule => {
                                  if (!schedule.date || !schedule.startTime || !schedule.endTime) return;
                                  
                                  const date = new Date(schedule.date);
                                  const dayOfWeek = date.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
                                  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                  const dayName = dayNames[dayOfWeek];
                                  
                                  // Format giờ: chuyển "08:00" thành "8h", "10:00" thành "10h"
                                  const formatTime = (timeStr) => {
                                    if (!timeStr) return '';
                                    const [hours, minutes] = timeStr.split(':');
                                    const hourNum = parseInt(hours, 10);
                                    return hourNum + 'h';
                                  };
                                  const startTime = formatTime(schedule.startTime);
                                  const endTime = formatTime(schedule.endTime);
                                  
                                  const key = `${dayOfWeek}-${schedule.startTime}-${schedule.endTime}`;
                                  
                                  if (!scheduleGroups[key]) {
                                    scheduleGroups[key] = {
                                      dayOfWeek,
                                      dayName,
                                      startTime: schedule.startTime,
                                      endTime: schedule.endTime,
                                      startTimeFormatted: startTime,
                                      endTimeFormatted: endTime
                                    };
                                  }
                                });
                                
                                // Sắp xếp theo thứ trong tuần (Thứ 2 -> Thứ 7 -> Chủ nhật)
                                const sortedGroups = Object.values(scheduleGroups).sort((a, b) => {
                                  // Sắp xếp: Thứ 2 (1) -> Thứ 7 (6) -> Chủ nhật (0)
                                  const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                                  const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                                  if (orderA !== orderB) return orderA - orderB;
                                  // Nếu cùng thứ, sắp xếp theo giờ bắt đầu
                                  return a.startTime.localeCompare(b.startTime);
                                });
                                
                                return sortedGroups.map((group, index) => (
                                  <div key={index} className="text-13 text-neutral-700 mb-1">
                                    {group.dayName} | {group.startTimeFormatted}-{group.endTimeFormatted}
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-neutral-500 text-13">Chưa có lịch học cố định</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cột phải: Lớp muốn đổi */}
                  <div className="col-md-6">
                    <div className="border border-success rounded-8 p-12 bg-success-25 h-100">
                      <h6 className="text-success fw-bold mb-12 text-14">Lớp muốn đổi</h6>
                      <div className="d-flex flex-column gap-2">
                        <div>
                          <small className="text-muted d-block mb-1">Tên khóa học:</small>
                          <div className="fw-bold">{selectedClassToChange.courseName || 'N/A'}</div>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Chọn lớp:</small>
                          {loadingAvailableClasses ? (
                            <div className="text-center py-8">
                              <Spinner animation="border" size="sm" />
                              <p className="text-neutral-600 mt-4 text-12">Đang tải...</p>
                            </div>
                          ) : availableClasses.length === 0 ? (
                            <div className="text-neutral-500 text-13">Không có lớp nào khác cùng khóa học</div>
                          ) : (
                            <Form.Select
                              value={selectedNewClassId || ''}
                              onChange={(e) => setSelectedNewClassId(e.target.value)}
                              className="border-neutral-200"
                              size="sm"
                            >
                              <option value="">-- Chọn lớp --</option>
                              {availableClasses.map((cls) => {
                                const clsId = cls._id || cls;
                                const clsName = cls.name || 'N/A';
                                return (
                                  <option key={clsId} value={clsId}>
                                    {clsName}
                                  </option>
                                );
                              })}
                            </Form.Select>
                          )}
                        </div>

                        {selectedNewClassId && (
                          <>
                            {loadingNewClassInfo ? (
                              <div className="text-center py-8">
                                <Spinner animation="border" size="sm" />
                                <p className="text-neutral-600 mt-4 text-12">Đang tải thông tin lớp...</p>
                              </div>
                            ) : selectedNewClassInfo ? (
                              <>
                                <div>
                                  <small className="text-muted d-block mb-1">Session đang học:</small>
                                  <div className="fw-semibold">
                                    {selectedNewClassInfo.currentSessionTitle || 'Chưa có session'}
                                    {selectedNewClassInfo.currentSessionOrder !== null && (
                                      <span className="text-neutral-500 ms-2">(Số thứ tự: {selectedNewClassInfo.currentSessionOrder})</span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ minHeight: '60px' }}>
                                  {((selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0) || (selectedNewClassInfo.studentCount !== null || selectedNewClassInfo.roomCapacity !== null)) && (
                                    <div className="d-flex justify-content-between align-items-start gap-3">
                                      {selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0 && (
                                        <div className="flex-fill">
                                          <small className="text-muted d-block mb-1">Phòng học:</small>
                                          <div className="fw-semibold">
                                            {selectedNewClassInfo.fixedSchedules[0]?.roomName || 'N/A'}
                                          </div>
                                        </div>
                                      )}
                                      {(selectedNewClassInfo.studentCount !== null || selectedNewClassInfo.roomCapacity !== null) && (
                                        <div className="flex-fill">
                                          <small className="text-muted d-block mb-1">Số lượng học sinh:</small>
                                          <div className="fw-semibold">
                                            {selectedNewClassInfo.studentCount !== null ? selectedNewClassInfo.studentCount : 'N/A'}
                                            {selectedNewClassInfo.roomCapacity !== null && (
                                              <span className="text-muted ms-2">/ {selectedNewClassInfo.roomCapacity}</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0 ? (
                                  <div>
                                    <small className="text-muted d-block mb-1">Lịch học:</small>
                                    <div className="border rounded-8 p-8 bg-white">
                                      {(() => {
                                        // Nhóm các buổi học theo thứ, startTime, endTime
                                        const scheduleGroups = {};
                                        selectedNewClassInfo.fixedSchedules.forEach(schedule => {
                                          if (!schedule.date || !schedule.startTime || !schedule.endTime) return;
                                          
                                          const date = new Date(schedule.date);
                                          const dayOfWeek = date.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
                                          const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                          const dayName = dayNames[dayOfWeek];
                                          
                                          // Format giờ: chuyển "08:00" thành "8h", "10:00" thành "10h"
                                          const formatTime = (timeStr) => {
                                            if (!timeStr) return '';
                                            const [hours, minutes] = timeStr.split(':');
                                            const hourNum = parseInt(hours, 10);
                                            return hourNum + 'h';
                                          };
                                          const startTime = formatTime(schedule.startTime);
                                          const endTime = formatTime(schedule.endTime);
                                          
                                          const key = `${dayOfWeek}-${schedule.startTime}-${schedule.endTime}`;
                                          
                                          if (!scheduleGroups[key]) {
                                            scheduleGroups[key] = {
                                              dayOfWeek,
                                              dayName,
                                              startTime: schedule.startTime,
                                              endTime: schedule.endTime,
                                              startTimeFormatted: startTime,
                                              endTimeFormatted: endTime
                                            };
                                          }
                                        });
                                        
                                        // Sắp xếp theo thứ trong tuần (Thứ 2 -> Thứ 7 -> Chủ nhật)
                                        const sortedGroups = Object.values(scheduleGroups).sort((a, b) => {
                                          // Sắp xếp: Thứ 2 (1) -> Thứ 7 (6) -> Chủ nhật (0)
                                          const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                                          const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                                          if (orderA !== orderB) return orderA - orderB;
                                          // Nếu cùng thứ, sắp xếp theo giờ bắt đầu
                                          return a.startTime.localeCompare(b.startTime);
                                        });
                                        
                                        return sortedGroups.map((group, index) => (
                                          <div key={index} className="text-13 text-neutral-700 mb-1">
                                            {group.dayName} | {group.startTimeFormatted}-{group.endTimeFormatted}
                                          </div>
                                        ));
                                      })()}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-neutral-500 text-13">Chưa có lịch học cố định</div>
                                )}
                              </>
                            ) : (
                              <div className="text-neutral-500 text-13">Không tìm thấy thông tin lớp</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowChangeClassModal(false);
                  setSelectedClassToChange(null);
                  setSelectedNewClassId(null);
                  setSelectedNewClassInfo(null);
                  setAvailableClasses([]);
                }}
              >
                Đóng
              </Button>
              <Button 
                variant="primary" 
                disabled={!selectedNewClassId || processing}
                onClick={() => {
                  if (!selectedClassToChange || !selectedNewClassId || !selectedNewClassInfo) {
                    alert('Vui lòng chọn lớp muốn đổi');
                    return;
                  }
                  
                  // Lưu thông tin đổi lớp vào state
                  setPendingClassChange({
                    oldClassId: selectedClassToChange.classId,
                    newClassId: selectedNewClassId,
                    oldClassInfo: selectedClassToChange,
                    newClassInfo: selectedNewClassInfo
                  });
                  
                  // Đóng modal đổi lớp
                  setShowChangeClassModal(false);
                  setSelectedClassToChange(null);
                  setSelectedNewClassId(null);
                  setSelectedNewClassInfo(null);
                  setAvailableClasses([]);
                  
                  // Giữ modal chi tiết mở (nếu đang mở)
                  // Nếu chưa mở thì không làm gì
                }}
              >
                {processing ? 'Đang xử lý...' : 'Xác nhận đổi lớp'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default RequestManagementPage;

