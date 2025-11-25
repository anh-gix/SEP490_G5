import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Pagination, Button, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import ScheduleCalendar from '../../components/class_management/ScheduleCalendar';
import changeRequestService from '../../services/changeRequestService';
import classService from '../../services/classService';
import { classScheduleService } from '../../services/classScheduleService';
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
  const [sortBy, setSortBy] = useState('oldest'); // 'oldest', 'newest', 'sender'
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [senderSchedule, setSenderSchedule] = useState([]);
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
  const [makeupClassOption, setMakeupClassOption] = useState(null); // 'existing' hoặc 'new'
  const [selectedMakeupClassId, setSelectedMakeupClassId] = useState(null); // Lớp được chọn cho buổi học bù
  const [selectedMakeupClassInfo, setSelectedMakeupClassInfo] = useState(null); // Thông tin lớp được chọn
  const [availableMakeupClasses, setAvailableMakeupClasses] = useState([]); // Danh sách lớp có sẵn
  const [availableMakeupClassesWithSchedules, setAvailableMakeupClassesWithSchedules] = useState([]); // Danh sách lớp kèm schedules
  const [loadingMakeupClasses, setLoadingMakeupClasses] = useState(false);
  const [loadingMakeupClassInfo, setLoadingMakeupClassInfo] = useState(false);
  const [selectedCurrentClassId, setSelectedCurrentClassId] = useState(null); // Lớp được chọn cho buổi được đổi (bên trái)
  const [selectedCurrentClassInfo, setSelectedCurrentClassInfo] = useState(null); // Thông tin lớp được chọn (bên trái)
  const [selectedCurrentScheduleId, setSelectedCurrentScheduleId] = useState(null); // Buổi học được chọn từ lớp hiện tại
  const [loadingCurrentClassInfo, setLoadingCurrentClassInfo] = useState(false);

  useEffect(() => {
    fetchChangeRequests();
  }, [page, searchTerm, filterStatus]);

  // Sort requests when sortBy changes
  const sortedRequests = useMemo(() => {
    if (!allChangeRequests || allChangeRequests.length === 0) return [];
    
    let sorted = [...allChangeRequests];
    
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'sender') {
      sorted.sort((a, b) => {
        const nameA = a.sender?.username || '';
        const nameB = b.sender?.username || '';
        return nameA.localeCompare(nameB);
      });
    }
    // 'oldest' is default from backend, no need to sort
    
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
      
      // Kiểm tra xem buổi này có phải là buổi nghỉ không
      const scheduleId = schedule._id || schedule.id || index;
      const isAbsentSchedule = pendingMakeupClasses.some(makeup => {
        const absentId = makeup.absentScheduleId || makeup.absentSchedule?.id || makeup.absentSchedule?._id;
        return absentId && (absentId.toString() === scheduleId.toString() || absentId.toString() === schedule._id?.toString());
      });
      
      return {
        id: scheduleId,
        date: dateStr,
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        className: schedule.class?.name || 'N/A',
        classId: schedule.class?._id || schedule.class || null,
        courseId: schedule.class?.course?._id || schedule.class?.course || null,
        courseName: schedule.class?.course?.name || 'N/A',
        roomName: schedule.room?.room_name || 'N/A',
        topic: schedule.session?.title || schedule.topic || '',
        status: isAbsentSchedule ? 'absent' : (schedule.status === 'fixed' ? 'scheduled' : schedule.status === 'temporary' ? 'makeup' : 'scheduled'),
        teacherName: schedule.class?.teacher?.username || 'N/A',
        lessonNumber: schedule.session?.order || '',
        lessonTopic: schedule.session?.title || '',
        sessionName: schedule.session?.title || 'N/A',
        sessionOrder: schedule.session?.order || '',
        attendanceStatus: attendanceStatus, // 'present', 'absent', 'late', 'excused', or null
        hasAttendance: !!attendanceStatus,
        isAbsentSchedule: isAbsentSchedule
      };
    });
    
    // Thêm các buổi học bù vào calendar
    const makeupSchedules = pendingMakeupClasses.map((makeup, index) => {
      if (!makeup.makeupSchedule || !makeup.makeupSchedule.date) return null;
      
      const scheduleDate = new Date(makeup.makeupSchedule.date);
      const dateStr = formatDateToYYYYMMDD(scheduleDate);
      
      return {
        id: `makeup-${index}-${makeup.makeupScheduleId}`,
        date: dateStr,
        startTime: makeup.makeupSchedule.startTime || '',
        endTime: makeup.makeupSchedule.endTime || '',
        className: makeup.makeupClassInfo?.className || 'N/A',
        classId: makeup.makeupClassId,
        courseName: makeup.makeupClassInfo?.courseName || 'N/A',
        roomName: makeup.makeupSchedule.roomName || 'N/A',
        topic: makeup.makeupSchedule.title || '',
        status: 'makeup',
        lessonNumber: makeup.makeupSchedule.order || '',
        sessionName: makeup.makeupSchedule.title || 'N/A',
        sessionOrder: makeup.makeupSchedule.order || '',
        attendanceStatus: null,
        hasAttendance: false,
        isMakeupSchedule: true
      };
    }).filter(Boolean);
    
    return [...schedules, ...makeupSchedules];
  }, [senderSchedule, pendingMakeupClasses]);

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
      return classId === classItem.classId;
    });

    if (classSchedules.length === 0) {
      alert('Không tìm thấy thông tin lớp học');
      return;
    }

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
    const fixedSchedulesList = sortedSchedules.map(sch => ({
      title: sch.session?.title || 'N/A',
      order: sch.session?.order || null,
      date: sch.date || null,
      startTime: sch.startTime || 'N/A',
      endTime: sch.endTime || 'N/A',
      roomName: sch.room?.room_name || 'N/A'
    }));

    // Tạo object thông tin lớp đang học đầy đủ
    const currentClassInfo = {
      classId: classItem.classId,
      className: classItem.className,
      courseName: classItem.courseName,
      courseId: classSchedules[0]?.class?.course?._id || classSchedules[0]?.class?.course || null,
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
            roomCapacity: sch.room?.capacity || classData.room?.capacity || null
          }));

          setSelectedMakeupClassInfo({
            className: classData.name || 'N/A',
            courseName: classData.courseName || 'N/A',
            fixedSchedules: fixedSchedulesList,
            schedules: fixedSchedulesList, // Lưu danh sách buổi học để chọn
            studentCount: classData.students?.length || 0,
            roomCapacity: classData.room?.capacity || null,
            selectedScheduleId: null // Reset khi load lớp mới
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
  }, [selectedMakeupClassId, classService]);

  // Hàm để lấy thông tin lớp hiện tại khi chọn từ dropdown (cho buổi được đổi - bên trái)
  useEffect(() => {
    const fetchCurrentClassInfo = async () => {
      if (!selectedCurrentClassId || !classService) {
        setSelectedCurrentClassInfo(null);
        setSelectedCurrentScheduleId(null);
        return;
      }

      try {
        setLoadingCurrentClassInfo(true);
        const response = await classService.getClassById(selectedCurrentClassId);
        
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
            roomCapacity: sch.room?.capacity || classData.room?.capacity || null
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
      } finally {
        setLoadingCurrentClassInfo(false);
      }
    };

    fetchCurrentClassInfo();
  }, [selectedCurrentClassId, classService]);

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
    if (!selectedCurrentClassInfo?.schedules || selectedCurrentClassInfo.schedules.length === 0) {
      return [];
    }
    
    // Lấy danh sách các absentScheduleId đã được chọn
    const selectedAbsentScheduleIds = (pendingMakeupClasses || []).map(makeup => {
      return makeup.absentScheduleId?.toString() || 
             makeup.absentSchedule?.id?.toString() || 
             makeup.absentSchedule?._id?.toString();
    }).filter(Boolean);
    
    // Lọc bỏ các buổi đã được chọn
    return selectedCurrentClassInfo.schedules.filter(schedule => {
      const scheduleId = (schedule.id || schedule._id)?.toString();
      return scheduleId && !selectedAbsentScheduleIds.includes(scheduleId);
    });
  }, [selectedCurrentClassInfo, pendingMakeupClasses]);

  // Filter các lớp có buổi học bù phù hợp
  const filteredMakeupClasses = useMemo(() => {
    if (!selectedCurrentScheduleId || !availableMakeupClassesWithSchedules || availableMakeupClassesWithSchedules.length === 0) {
      return availableMakeupClasses || [];
    }
    
    // Lấy thông tin buổi nghỉ
    const currentSchedule = selectedCurrentClassInfo?.schedules?.find(
      s => (s.id || s._id) === selectedCurrentScheduleId
    );
    const currentSessionOrder = currentSchedule?.order;
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
        
        // Cùng session order
        if (schedule.order !== currentSessionOrder) {
          return false;
        }
        
        // Ngày sau buổi nghỉ
        if (schedule.date && currentScheduleDate) {
          const scheduleDate = new Date(schedule.date);
          const currentDate = new Date(currentScheduleDate);
          scheduleDate.setHours(0, 0, 0, 0);
          currentDate.setHours(0, 0, 0, 0);
          
          if (scheduleDate.getTime() <= currentDate.getTime()) {
            return false;
          }
        }
        
        // Kiểm tra conflict với lịch học của sinh viên
        if (checkScheduleConflict(schedule, senderSchedule, selectedCurrentScheduleId)) {
          return false;
        }
        
        return true;
      });
      
      return hasValidSchedule;
    });
    
    return classesWithValidSchedules;
  }, [selectedCurrentScheduleId, availableMakeupClassesWithSchedules, selectedCurrentClassInfo, availableMakeupClasses, senderSchedule, pendingMakeupClasses]);

  // Tự động load dữ liệu khi mở modal "Thêm buổi học bù"
  useEffect(() => {
    if (showMakeupClassModal && !makeupClassOption && studentClasses.length > 0) {
      setMakeupClassOption('existing');
      // Set lớp đầu tiên làm mặc định
      const firstClass = studentClasses[0];
      setSelectedCurrentClassId(firstClass.classId);
    }
  }, [showMakeupClassModal, studentClasses, makeupClassOption]);

  // Hàm để mở modal chi tiết khi chấp nhận
  const handleApproveClick = async (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
    setRejectReason('');
    setLoadingSchedule(true);
    setSenderSchedule([]);
    
    try {
      const response = await changeRequestService.getSenderSchedule(request._id);
      if (response.success) {
        setSenderSchedule(response.schedules || []);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setSenderSchedule([]);
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
      await changeRequestService.approveChangeRequest(selectedRequest._id);
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

  const handleReject = async () => {
    if (!requestToReject) return;
    
    try {
      setProcessing(true);
      await changeRequestService.rejectChangeRequest(requestToReject._id, rejectReason || null);
      setShowRejectModal(false);
      setRequestToReject(null);
      setRejectReason('');
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


  // Nếu đang hiển thị chi tiết đơn, render component RequestDetailPage
  if (showDetailModal && selectedRequest) {
    return (
      <>
        <RequestDetailPage
          selectedRequest={selectedRequest}
          senderSchedule={senderSchedule}
          loadingSchedule={loadingSchedule}
          pendingClassChange={pendingClassChange}
          pendingMakeupClasses={pendingMakeupClasses}
          pendingMakeupSessions={pendingMakeupSessions}
          onBack={() => {
            setShowDetailModal(false);
            setRejectReason('');
            setSelectedRequest(null);
            setSenderSchedule([]);
            setPendingClassChange(null);
            setPendingMakeupClasses([]);
            setPendingMakeupSessions([]);
          }}
          onApprove={handleApprove}
          onReject={() => handleRejectClick(selectedRequest)}
          onChangeClass={handleChangeClassClick}
          onAddMakeupClass={() => {
            setShowMakeupClassModal(true);
            setMakeupClassOption(null);
          }}
          onRemoveMakeupClass={handleRemoveMakeupClass}
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
          setSelectedMakeupClassInfo(null);
          setAvailableMakeupClasses([]);
        }} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Thêm buổi học bù</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-16">
            <div className="d-flex gap-12 mb-16" style={{ width: '100%' }}>
              <Button
                variant={makeupClassOption === 'existing' ? 'primary' : 'outline-primary'}
                className="py-12 d-flex align-items-center justify-content-center gap-2"
                style={{ flex: '1 1 0', minWidth: 0, width: 'calc(50% - 6px)' }}
                onClick={async () => {
                  setMakeupClassOption('existing');
                  // Lấy lớp đầu tiên từ studentClasses làm lớp hiện tại
                  if (studentClasses.length > 0) {
                    const firstClass = studentClasses[0];
                    setSelectedCurrentClassId(firstClass.classId);
                    
                    // Lấy danh sách lớp cùng khóa học
                    const classSchedules = senderSchedule.filter(sch => {
                      const classId = sch.class?._id?.toString() || sch.class?.toString();
                      return classId === firstClass.classId;
                    });

                    if (classSchedules.length > 0) {
                      const courseId = classSchedules[0]?.class?.course?._id || classSchedules[0]?.class?.course || null;
                      setSelectedMakeupClassId(null);
                      setSelectedMakeupClassInfo(null);
                      setAvailableMakeupClasses([]);
                      setLoadingMakeupClasses(true);

                      try {
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
                      } catch (err) {
                        console.error('Error fetching available classes:', err);
                        setAvailableMakeupClasses([]);
                        setAvailableMakeupClassesWithSchedules([]);
                      } finally {
                        setLoadingMakeupClasses(false);
                      }
                    }
                  }
                }}
              >
                <i className="fas fa-calendar-check"></i>
                Chọn buổi của lớp đang sẵn có
              </Button>
              
              <Button
                variant={makeupClassOption === 'new' ? 'success' : 'outline-success'}
                className="py-12 d-flex align-items-center justify-content-center gap-2"
                style={{ flex: '1 1 0', minWidth: 0, width: 'calc(50% - 6px)' }}
                onClick={() => {
                  setMakeupClassOption('new');
                  // TODO: Xử lý logic tạo lớp mới
                }}
              >
                <i className="fas fa-plus-circle"></i>
                Tạo lớp mới
              </Button>
            </div>

            {/* Hiển thị nội dung khi đã chọn option */}
            {(makeupClassOption === 'existing' || makeupClassOption === 'new') && (
              <div className="row g-3 mt-16">
                {/* Cột trái: Buổi nghỉ - hiển thị cho cả existing và new */}
                <div className="col-md-6">
                  <div className="border border-primary rounded-8 p-12 bg-primary-25">
                    <h6 className="text-primary fw-bold mb-12 text-14">Buổi nghỉ</h6>
                    <div className="d-flex flex-column gap-2">
                      <div>
                        <small className="text-muted d-block mb-1">Chọn lớp:</small>
                        {studentClasses.length === 0 ? (
                          <div className="text-neutral-500 text-13">Không có lớp học</div>
                        ) : (
                          <Form.Select
                            value={selectedCurrentClassId || ''}
                            onChange={(e) => {
                              setSelectedCurrentClassId(e.target.value);
                              setSelectedCurrentScheduleId(null);
                            }}
                            className="border-neutral-200"
                            size="sm"
                          >
                            <option value="">-- Chọn lớp --</option>
                            {studentClasses.map((cls) => {
                              const clsId = cls.classId || cls._id;
                              return (
                                <option key={clsId} value={clsId}>
                                  {cls.className || 'N/A'}
                                </option>
                              );
                            })}
                          </Form.Select>
                        )}
                      </div>

                      {selectedCurrentClassId && (
                        <>
                          {loadingCurrentClassInfo ? (
                            <div className="text-center py-8">
                              <Spinner animation="border" size="sm" />
                              <p className="text-neutral-600 mt-4 text-12">Đang tải thông tin lớp...</p>
                            </div>
                          ) : selectedCurrentClassInfo ? (
                            <>
                              <div>
                                <small className="text-muted d-block mb-1">Tên khóa học:</small>
                                <div className="fw-bold">{selectedCurrentClassInfo.courseName || 'N/A'}</div>
                              </div>
                              <div>
                                <small className="text-muted d-block mb-1">Chọn buổi học:</small>
                                {filteredAbsentSchedules && filteredAbsentSchedules.length > 0 ? (
                                  <Form.Select
                                    value={selectedCurrentScheduleId || ''}
                                    onChange={(e) => setSelectedCurrentScheduleId(e.target.value)}
                                    className="border-neutral-200"
                                    size="sm"
                                  >
                                    <option value="">-- Chọn buổi học --</option>
                                    {filteredAbsentSchedules.map((schedule) => {
                                      const scheduleId = schedule.id || schedule._id;
                                      const dateStr = schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : '';
                                      const timeStr = `${schedule.startTime} - ${schedule.endTime}`;
                                      const displayText = `${schedule.title}${dateStr ? ` (${dateStr})` : ''} - ${timeStr}`;
                                      return (
                                        <option key={scheduleId} value={scheduleId}>
                                          {displayText}
                                        </option>
                                      );
                                    })}
                                  </Form.Select>
                                ) : (
                                  <div className="text-neutral-500 text-13">
                                    {selectedCurrentClassInfo.schedules && selectedCurrentClassInfo.schedules.length > 0
                                      ? 'Tất cả buổi học đã được chọn'
                                      : 'Không có buổi học'}
                                  </div>
                                )}
                              </div>
                              {selectedCurrentScheduleId && selectedCurrentClassInfo.schedules && (
                                <>
                                  {(() => {
                                    const selectedSchedule = selectedCurrentClassInfo.schedules.find(
                                      s => (s.id || s._id) === selectedCurrentScheduleId
                                    );
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
                                            <div className="fw-semibold">{selectedSchedule.roomName || 'N/A'}</div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </>
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

                {/* Cột phải: Buổi học bù - chỉ hiển thị khi chọn existing */}
                {makeupClassOption === 'existing' && (
                  <div className="col-md-6">
                  <div className="border border-success rounded-8 p-12 bg-success-25">
                    <h6 className="text-success fw-bold mb-12 text-14">Buổi học bù</h6>
                    <div className="d-flex flex-column gap-2">
                      {selectedCurrentClassInfo && (
                        <div>
                          <small className="text-muted d-block mb-1">Tên khóa học:</small>
                          <div className="fw-bold">{selectedCurrentClassInfo.courseName || 'N/A'}</div>
                        </div>
                      )}
                      <div>
                        <small className="text-muted d-block mb-1">Chọn lớp:</small>
                        {loadingMakeupClasses ? (
                          <div className="text-center py-8">
                            <Spinner animation="border" size="sm" />
                            <p className="text-neutral-600 mt-4 text-12">Đang tải...</p>
                          </div>
                        ) : !filteredMakeupClasses || filteredMakeupClasses.length === 0 ? (
                          <div className="text-neutral-500 text-13">
                            {!availableMakeupClasses || availableMakeupClasses.length === 0 
                              ? 'Không có lớp nào khác cùng khóa học'
                              : 'Không có lớp nào có buổi học bù phù hợp'}
                          </div>
                        ) : (
                          <Form.Select
                            value={selectedMakeupClassId || ''}
                            onChange={(e) => {
                              setSelectedMakeupClassId(e.target.value);
                              // Reset selected schedule khi đổi lớp
                              setSelectedMakeupClassInfo(null);
                            }}
                            className="border-neutral-200"
                            size="sm"
                          >
                            <option value="">-- Chọn lớp --</option>
                            {(filteredMakeupClasses || []).map((cls) => {
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

                      {selectedMakeupClassId && (
                        <>
                          {loadingMakeupClassInfo ? (
                            <div className="text-center py-8">
                              <Spinner animation="border" size="sm" />
                              <p className="text-neutral-600 mt-4 text-12">Đang tải thông tin lớp...</p>
                            </div>
                          ) : selectedMakeupClassInfo ? (
                            <>
                              <div>
                                <small className="text-muted d-block mb-1">Chọn buổi học:</small>
                                {(() => {
                                  // Lấy thông tin buổi nghỉ đã chọn
                                  const currentSchedule = selectedCurrentClassInfo?.schedules?.find(
                                    s => (s.id || s._id) === selectedCurrentScheduleId
                                  );
                                  const currentSessionOrder = currentSchedule?.order;
                                  const currentScheduleDate = currentSchedule?.date;

                                  // Format ngày buổi nghỉ để so sánh
                                  const getDateString = (dateInput) => {
                                    if (!dateInput) return null;
                                    const d = new Date(dateInput);
                                    if (isNaN(d.getTime())) return null;
                                    const year = d.getFullYear();
                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                    const day = String(d.getDate()).padStart(2, '0');
                                    return `${year}-${month}-${day}`;
                                  };
                                  const currentDateStr = currentScheduleDate ? getDateString(currentScheduleDate) : null;

                                  // Lấy danh sách các makeupScheduleId đã được chọn
                                  const selectedMakeupScheduleIds = (pendingMakeupClasses || []).map(makeup => {
                                    return makeup.makeupScheduleId?.toString() || 
                                           makeup.makeupSchedule?.id?.toString() || 
                                           makeup.makeupSchedule?._id?.toString();
                                  }).filter(Boolean);

                                  // Filter chỉ lấy các buổi có cùng session order và ngày sau buổi nghỉ
                                  const filteredSchedules = selectedMakeupClassInfo.fixedSchedules && selectedMakeupClassInfo.fixedSchedules.length > 0
                                    ? selectedMakeupClassInfo.fixedSchedules.filter(schedule => {
                                        // Bỏ qua buổi đã được chọn
                                        const scheduleId = (schedule.id || schedule._id)?.toString();
                                        if (scheduleId && selectedMakeupScheduleIds.includes(scheduleId)) {
                                          return false;
                                        }
                                        
                                        // Nếu chưa chọn buổi nghỉ, không hiển thị
                                        if (!selectedCurrentScheduleId || currentSessionOrder === null || currentSessionOrder === undefined) {
                                          return false;
                                        }
                                        
                                        // Chỉ hiển thị buổi có cùng order
                                        if (schedule.order !== currentSessionOrder) {
                                          return false;
                                        }
                                        
                                        // Validate ngày: buổi học bù phải có ngày SAU buổi nghỉ
                                        if (currentScheduleDate && schedule.date) {
                                          const currentDate = new Date(currentScheduleDate);
                                          const scheduleDate = new Date(schedule.date);
                                          
                                          // Set time về 0 để chỉ so sánh ngày
                                          currentDate.setHours(0, 0, 0, 0);
                                          scheduleDate.setHours(0, 0, 0, 0);
                                          
                                          // Buổi học bù phải sau buổi nghỉ (không được bằng hoặc trước)
                                          if (scheduleDate.getTime() <= currentDate.getTime()) {
                                            return false; // Không hiển thị buổi trùng ngày hoặc trước ngày buổi nghỉ
                                          }
                                        }
                                        
                                        // Kiểm tra conflict với lịch học của sinh viên
                                        if (checkScheduleConflict(schedule, senderSchedule, selectedCurrentScheduleId)) {
                                          return false;
                                        }
                                        
                                        return true;
                                      })
                                    : [];

                                  if (!selectedCurrentScheduleId || currentSessionOrder === null || currentSessionOrder === undefined) {
                                    return (
                                      <div className="text-neutral-500 text-13">
                                        Vui lòng chọn buổi nghỉ trước
                                      </div>
                                    );
                                  }

                                  if (filteredSchedules.length === 0) {
                                    return (
                                      <div className="text-neutral-500 text-13">
                                        Không có buổi học bù cùng session và sau ngày buổi nghỉ
                                      </div>
                                    );
                                  }

                                  return (
                                    <Form.Select
                                      value={selectedMakeupClassInfo.selectedScheduleId || ''}
                                      onChange={(e) => {
                                        // Lưu selectedScheduleId vào selectedMakeupClassInfo
                                        setSelectedMakeupClassInfo({
                                          ...selectedMakeupClassInfo,
                                          selectedScheduleId: e.target.value
                                        });
                                      }}
                                      className="border-neutral-200"
                                      size="sm"
                                    >
                                      <option value="">-- Chọn buổi học --</option>
                                      {filteredSchedules.map((schedule) => {
                                        const scheduleId = schedule.id || schedule._id;
                                        const dateStr = schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : '';
                                        const timeStr = `${schedule.startTime} - ${schedule.endTime}`;
                                        const displayText = `${schedule.title}${dateStr ? ` (${dateStr})` : ''} - ${timeStr}`;
                                        return (
                                          <option key={scheduleId} value={scheduleId}>
                                            {displayText}
                                          </option>
                                        );
                                      })}
                                    </Form.Select>
                                  );
                                })()}
                              </div>
                              {selectedMakeupClassInfo.selectedScheduleId && selectedMakeupClassInfo.fixedSchedules && (
                                <>
                                  {(() => {
                                    const selectedSchedule = selectedMakeupClassInfo.fixedSchedules.find(
                                      s => (s.id || s._id) === selectedMakeupClassInfo.selectedScheduleId
                                    );
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
                                            <div className="fw-semibold">{selectedSchedule.roomName || 'N/A'}</div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </>
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
                )}

                {/* Cột phải: Tạo lớp mới - chỉ hiển thị khi chọn new */}
                {makeupClassOption === 'new' && (
                  <div className="col-md-6">
                    {/* Placeholder - sẽ được thêm sau */}
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowMakeupClassModal(false);
                setMakeupClassOption(null);
                setSelectedCurrentClassId(null);
                setSelectedCurrentClassInfo(null);
                setSelectedCurrentScheduleId(null);
                setSelectedMakeupClassId(null);
                setSelectedMakeupClassInfo(null);
                setAvailableMakeupClasses([]);
              }}
            >
              Đóng
            </Button>
            {makeupClassOption === 'existing' && (
              <Button 
                variant="primary" 
                disabled={!selectedCurrentScheduleId || !selectedMakeupClassInfo?.selectedScheduleId || processing}
                onClick={async () => {
                  if (!selectedCurrentScheduleId || !selectedMakeupClassInfo?.selectedScheduleId) {
                    alert('Vui lòng chọn đầy đủ buổi học ở cả 2 cột');
                    return;
                  }

                  try {
                    setProcessing(true);
                    
                    // Lấy thông tin buổi học được chọn (bên phải - buổi sẽ đổi sang)
                    const selectedSchedule = selectedMakeupClassInfo.schedules.find(
                      s => (s.id || s._id) === selectedMakeupClassInfo.selectedScheduleId
                    );

                    if (!selectedSchedule || !selectedSchedule.date || !selectedSchedule.startTime || !selectedSchedule.endTime) {
                      alert('Thông tin buổi học không đầy đủ');
                      setProcessing(false);
                      return;
                    }

                    // Lấy thông tin lớp được chọn (bên phải)
                    const selectedClass = availableMakeupClasses.find(
                      cls => (cls._id || cls) === selectedMakeupClassId
                    );

                    if (!selectedClass || !selectedClass.room) {
                      alert('Thông tin lớp không đầy đủ');
                      setProcessing(false);
                      return;
                    }

                    // Format date thành YYYY-MM-DD
                    const scheduleDate = new Date(selectedSchedule.date);
                    const dateStr = formatDateToYYYYMMDD(scheduleDate);

                    // Kiểm tra conflict
                    const validateData = {
                      classId: selectedMakeupClassId,
                      date: dateStr,
                      startTime: selectedSchedule.startTime,
                      endTime: selectedSchedule.endTime,
                      room: selectedClass.room._id || selectedClass.room
                    };

                    const validateResponse = await classScheduleService.validateAddClassSchedule(validateData);
                    
                    if (!validateResponse.success) {
                      alert(`Lỗi: ${validateResponse.message || 'Không thể kiểm tra xung đột'}`);
                      setProcessing(false);
                      return;
                    }
                    
                    if (validateResponse.hasConflict || (validateResponse.conflicts && (
                      (validateResponse.conflicts.teacher && validateResponse.conflicts.teacher.length > 0) ||
                      (validateResponse.conflicts.room && validateResponse.conflicts.room.length > 0) ||
                      (validateResponse.conflicts.students && validateResponse.conflicts.students.length > 0)
                    ))) {
                      // Hiển thị thông báo conflict
                      let conflictMessages = [];
                      if (validateResponse.conflicts) {
                        if (validateResponse.conflicts.teacher && validateResponse.conflicts.teacher.length > 0) {
                          const teacherConflicts = validateResponse.conflicts.teacher.map(c => 
                            `Lớp ${c.className} vào ${c.time}`
                          );
                          conflictMessages.push(`Giảng viên: ${teacherConflicts.join(', ')}`);
                        }
                        if (validateResponse.conflicts.room && validateResponse.conflicts.room.length > 0) {
                          const roomConflicts = validateResponse.conflicts.room.map(c => 
                            `Lớp ${c.className} vào ${c.time}`
                          );
                          conflictMessages.push(`Phòng học: ${roomConflicts.join(', ')}`);
                        }
                        if (validateResponse.conflicts.students && validateResponse.conflicts.students.length > 0) {
                          const studentConflicts = validateResponse.conflicts.students.map(c => 
                            `${c.studentName || 'Học sinh'} - Lớp ${c.className} vào ${c.time}`
                          );
                          conflictMessages.push(`Học sinh: ${studentConflicts.join(', ')}`);
                        }
                      }
                      
                      const message = conflictMessages.length > 0 
                        ? `⚠️ Có xung đột lịch học:\n\n${conflictMessages.join('\n')}\n\nBạn có muốn tiếp tục không?`
                        : '⚠️ Có xung đột lịch học. Bạn có muốn tiếp tục không?';
                      
                      const shouldContinue = window.confirm(message);
                      if (!shouldContinue) {
                        setProcessing(false);
                        return;
                      }
                    }

                    // Lấy thông tin buổi nghỉ đã chọn
                    const absentSchedule = selectedCurrentClassInfo.schedules.find(
                      s => (s.id || s._id) === selectedCurrentScheduleId
                    );

                    if (!absentSchedule) {
                      alert('Không tìm thấy thông tin buổi nghỉ');
                      setProcessing(false);
                      return;
                    }

                    // Lấy thông tin buổi học bù từ fixedSchedules
                    const makeupSchedule = selectedMakeupClassInfo.fixedSchedules.find(
                      s => (s.id || s._id) === selectedMakeupClassInfo.selectedScheduleId
                    );

                    if (!makeupSchedule) {
                      alert('Không tìm thấy thông tin buổi học bù');
                      setProcessing(false);
                      return;
                    }

                    // Lưu thông tin buổi học bù vào state
                    const newMakeupEntry = {
                      absentScheduleId: selectedCurrentScheduleId,
                      absentSchedule: absentSchedule,
                      absentClassId: selectedCurrentClassId,
                      absentClassInfo: selectedCurrentClassInfo,
                      makeupScheduleId: selectedMakeupClassInfo.selectedScheduleId,
                      makeupSchedule: makeupSchedule,
                      makeupClassId: selectedMakeupClassId,
                      makeupClassInfo: selectedMakeupClassInfo
                    };

                    // Thêm vào danh sách pending makeup classes
                    setPendingMakeupClasses(prev => [...prev, newMakeupEntry]);

                    // Đóng modal và reset các state liên quan
                    setShowMakeupClassModal(false);
                    setMakeupClassOption(null);
                    setSelectedCurrentClassId(null);
                    setSelectedCurrentClassInfo(null);
                    setSelectedCurrentScheduleId(null);
                    setSelectedMakeupClassId(null);
                    setSelectedMakeupClassInfo(null);
                    setAvailableMakeupClasses([]);
                    
                  } catch (err) {
                    console.error('Error validating makeup session:', err);
                    const errorMessage = err.message || err.response?.data?.message || 'Không thể kiểm tra xung đột lịch học';
                    alert(`Lỗi: ${errorMessage}`);
                  } finally {
                    setProcessing(false);
                  }
                }}
              >
                {processing ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            )}
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

                <Col md={3}>
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
                      <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Người gửi</th>
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
                        <td colSpan="7" className="text-center py-40 text-neutral-500">
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
                              <div className="d-flex gap-2">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveClick(request);
                                  }}
                                  disabled={processing}
                                >
                                  <i className="fas fa-check me-1"></i>
                                  Chấp nhận
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectClick(request);
                                  }}
                                  disabled={processing}
                                >
                                  <i className="fas fa-times me-1"></i>
                                  Từ chối
                                </Button>
                              </div>
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

          {/* Modal Thêm buổi học bù */}
          <Modal show={showMakeupClassModal} onHide={() => {
            setShowMakeupClassModal(false);
            setMakeupClassOption(null);
            setSelectedCurrentClassId(null);
            setSelectedCurrentClassInfo(null);
            setSelectedCurrentScheduleId(null);
            setSelectedMakeupClassId(null);
            setSelectedMakeupClassInfo(null);
            setAvailableMakeupClasses([]);
          }} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>Thêm buổi học bù</Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-16">
              <div className="d-flex gap-12 mb-16" style={{ width: '100%' }}>
                <Button
                  variant={makeupClassOption === 'existing' ? 'primary' : 'outline-primary'}
                  className="py-12 d-flex align-items-center justify-content-center gap-2"
                  style={{ flex: '1 1 0', minWidth: 0, width: 'calc(50% - 6px)' }}
                  onClick={async () => {
                    setMakeupClassOption('existing');
                    // Lấy lớp đầu tiên từ studentClasses làm lớp hiện tại
                    if (studentClasses.length > 0) {
                      const firstClass = studentClasses[0];
                      setSelectedCurrentClassId(firstClass.classId);
                      
                      // Lấy danh sách lớp cùng khóa học
                      const classSchedules = senderSchedule.filter(sch => {
                        const classId = sch.class?._id?.toString() || sch.class?.toString();
                        return classId === firstClass.classId;
                      });

                      if (classSchedules.length > 0) {
                        const courseId = classSchedules[0]?.class?.course?._id || classSchedules[0]?.class?.course || null;
                        setSelectedMakeupClassId(null);
                        setSelectedMakeupClassInfo(null);
                        setAvailableMakeupClasses([]);
                        setLoadingMakeupClasses(true);

                        try {
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
                        } catch (err) {
                          console.error('Error fetching available classes:', err);
                          setAvailableMakeupClasses([]);
                          setAvailableMakeupClassesWithSchedules([]);
                        } finally {
                          setLoadingMakeupClasses(false);
                        }
                      }
                    }
                  }}
                >
                  <i className="fas fa-calendar-check"></i>
                  Chọn buổi của lớp đang sẵn có
                </Button>
                
                <Button
                  variant={makeupClassOption === 'new' ? 'success' : 'outline-success'}
                  className="py-12 d-flex align-items-center justify-content-center gap-2"
                  style={{ flex: '1 1 0', minWidth: 0, width: 'calc(50% - 6px)' }}
                  onClick={() => {
                    setMakeupClassOption('new');
                    // TODO: Xử lý logic tạo lớp mới
                  }}
                >
                  <i className="fas fa-plus-circle"></i>
                  Tạo lớp mới
                </Button>
      </div>

              {/* Hiển thị nội dung khi đã chọn option */}
              {(makeupClassOption === 'existing' || makeupClassOption === 'new') && (
                <div className="row g-3 mt-16">
                  {/* Cột trái: Buổi nghỉ - hiển thị cho cả existing và new */}
                  <div className="col-md-6">
                    <div className="border border-primary rounded-8 p-12 bg-primary-25">
                      <h6 className="text-primary fw-bold mb-12 text-14">Buổi nghỉ</h6>
                      <div className="d-flex flex-column gap-2">
                        <div>
                          <small className="text-muted d-block mb-1">Chọn lớp:</small>
                          {studentClasses.length === 0 ? (
                            <div className="text-neutral-500 text-13">Không có lớp học</div>
                          ) : (
                            <Form.Select
                              value={selectedCurrentClassId || ''}
                              onChange={(e) => {
                                setSelectedCurrentClassId(e.target.value);
                                setSelectedCurrentScheduleId(null);
                              }}
                              className="border-neutral-200"
                              size="sm"
                            >
                              <option value="">-- Chọn lớp --</option>
                              {studentClasses.map((cls) => {
                                const clsId = cls.classId || cls._id;
                                return (
                                  <option key={clsId} value={clsId}>
                                    {cls.className || 'N/A'}
                                  </option>
                                );
                              })}
                              </Form.Select>
                            )}
                        </div>

                        {selectedCurrentClassId && (
                          <>
                            {loadingCurrentClassInfo ? (
                              <div className="text-center py-8">
                                <Spinner animation="border" size="sm" />
                                <p className="text-neutral-600 mt-4 text-12">Đang tải thông tin lớp...</p>
                              </div>
                            ) : selectedCurrentClassInfo ? (
                              <>
                                <div>
                                  <small className="text-muted d-block mb-1">Tên lớp:</small>
                                  <div className="fw-bold">{selectedCurrentClassInfo.className || 'N/A'}</div>
                                </div>
                                <div>
                                  <small className="text-muted d-block mb-1">Tên khóa học:</small>
                                  <div className="fw-bold">{selectedCurrentClassInfo.courseName || 'N/A'}</div>
                                </div>
                                <div>
                                  <small className="text-muted d-block mb-1">Chọn buổi học:</small>
                                  {filteredAbsentSchedules && filteredAbsentSchedules.length > 0 ? (
                                    <Form.Select
                                      value={selectedCurrentScheduleId || ''}
                                      onChange={(e) => setSelectedCurrentScheduleId(e.target.value)}
                                      className="border-neutral-200"
                                      size="sm"
                                    >
                                      <option value="">-- Chọn buổi học --</option>
                                      {filteredAbsentSchedules.map((schedule) => {
                                        const scheduleId = schedule.id || schedule._id;
                                        const dateStr = schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : '';
                                        const timeStr = `${schedule.startTime} - ${schedule.endTime}`;
                                        const displayText = `${schedule.title}${dateStr ? ` (${dateStr})` : ''} - ${timeStr}`;
                                        return (
                                          <option key={scheduleId} value={scheduleId}>
                                            {displayText}
                                          </option>
                                        );
                                      })}
                                    </Form.Select>
                                  ) : (
                                    <div className="text-neutral-500 text-13">
                                      {selectedCurrentClassInfo.schedules && selectedCurrentClassInfo.schedules.length > 0
                                        ? 'Tất cả buổi học đã được chọn'
                                        : 'Không có buổi học'}
                                    </div>
                                  )}
                                </div>
                                {selectedCurrentScheduleId && selectedCurrentClassInfo.schedules && (
                                  <>
                                    {(() => {
                                      const selectedSchedule = selectedCurrentClassInfo.schedules.find(
                                        s => (s.id || s._id) === selectedCurrentScheduleId
                                      );
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
                                              <div className="fw-semibold">{selectedSchedule.roomName || 'N/A'}</div>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </>
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

                  {/* Cột phải: Buổi học bù - chỉ hiển thị khi chọn existing */}
                  {makeupClassOption === 'existing' && (
                    <div className="col-md-6">
                      <div className="border border-success rounded-8 p-12 bg-success-25">
                        <h6 className="text-success fw-bold mb-12 text-14">Buổi học bù</h6>
                      <div className="d-flex flex-column gap-2">
                        {selectedCurrentClassInfo && (
                          <div>
                            <small className="text-muted d-block mb-1">Tên khóa học:</small>
                            <div className="fw-bold">{selectedCurrentClassInfo.courseName || 'N/A'}</div>
                          </div>
                        )}
                        <div>
                          <small className="text-muted d-block mb-1">Chọn lớp:</small>
                          {loadingMakeupClasses ? (
                            <div className="text-center py-8">
                              <Spinner animation="border" size="sm" />
                              <p className="text-neutral-600 mt-4 text-12">Đang tải...</p>
                            </div>
                          ) : !filteredMakeupClasses || filteredMakeupClasses.length === 0 ? (
                            <div className="text-neutral-500 text-13">
                              {!availableMakeupClasses || availableMakeupClasses.length === 0 
                                ? 'Không có lớp nào khác cùng khóa học'
                                : 'Không có lớp nào có buổi học bù phù hợp'}
                            </div>
                          ) : (
                            <Form.Select
                              value={selectedMakeupClassId || ''}
                              onChange={(e) => {
                                setSelectedMakeupClassId(e.target.value);
                                // Reset selected schedule khi đổi lớp
                                setSelectedMakeupClassInfo(null);
                              }}
                              className="border-neutral-200"
                              size="sm"
                            >
                              <option value="">-- Chọn lớp --</option>
                              {(filteredMakeupClasses || []).map((cls) => {
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

                        {selectedMakeupClassId && (
                          <>
                            {loadingMakeupClassInfo ? (
                              <div className="text-center py-8">
                                <Spinner animation="border" size="sm" />
                                <p className="text-neutral-600 mt-4 text-12">Đang tải thông tin lớp...</p>
                              </div>
                            ) : selectedMakeupClassInfo ? (
                              <>
                                <div>
                                  <small className="text-muted d-block mb-1">Chọn buổi học:</small>
                                  {(() => {
                                    // Lấy thông tin buổi nghỉ đã chọn
                                    const currentSchedule = selectedCurrentClassInfo?.schedules?.find(
                                      s => (s.id || s._id) === selectedCurrentScheduleId
                                    );
                                    const currentSessionOrder = currentSchedule?.order;
                                    const currentScheduleDate = currentSchedule?.date;

                                    // Format ngày buổi nghỉ để so sánh
                                    const getDateString = (dateInput) => {
                                      if (!dateInput) return null;
                                      const d = new Date(dateInput);
                                      if (isNaN(d.getTime())) return null;
                                      const year = d.getFullYear();
                                      const month = String(d.getMonth() + 1).padStart(2, '0');
                                      const day = String(d.getDate()).padStart(2, '0');
                                      return `${year}-${month}-${day}`;
                                    };
                                    const currentDateStr = currentScheduleDate ? getDateString(currentScheduleDate) : null;

                                    // Lấy danh sách các makeupScheduleId đã được chọn
                                    const selectedMakeupScheduleIds = (pendingMakeupClasses || []).map(makeup => {
                                      return makeup.makeupScheduleId?.toString() || 
                                             makeup.makeupSchedule?.id?.toString() || 
                                             makeup.makeupSchedule?._id?.toString();
                                    }).filter(Boolean);

                                    // Filter chỉ lấy các buổi có cùng session order và ngày sau buổi nghỉ
                                    const filteredSchedules = selectedMakeupClassInfo.fixedSchedules && selectedMakeupClassInfo.fixedSchedules.length > 0
                                      ? selectedMakeupClassInfo.fixedSchedules.filter(schedule => {
                                          // Bỏ qua buổi đã được chọn
                                          const scheduleId = (schedule.id || schedule._id)?.toString();
                                          if (scheduleId && selectedMakeupScheduleIds.includes(scheduleId)) {
                                            return false;
                                          }
                                          
                                          // Nếu chưa chọn buổi nghỉ, không hiển thị
                                          if (!selectedCurrentScheduleId || currentSessionOrder === null || currentSessionOrder === undefined) {
                                            return false;
                                          }
                                          
                                          // Chỉ hiển thị buổi có cùng order
                                          if (schedule.order !== currentSessionOrder) {
                                            return false;
                                          }
                                          
                                          // Validate ngày: buổi học bù phải có ngày SAU buổi nghỉ
                                          if (currentScheduleDate && schedule.date) {
                                            const currentDate = new Date(currentScheduleDate);
                                            const scheduleDate = new Date(schedule.date);
                                            
                                            // Set time về 0 để chỉ so sánh ngày
                                            currentDate.setHours(0, 0, 0, 0);
                                            scheduleDate.setHours(0, 0, 0, 0);
                                            
                                            // Buổi học bù phải sau buổi nghỉ (không được bằng hoặc trước)
                                            if (scheduleDate.getTime() <= currentDate.getTime()) {
                                              return false; // Không hiển thị buổi trùng ngày hoặc trước ngày buổi nghỉ
                                            }
                                          }
                                          
                                          // Kiểm tra conflict với lịch học của sinh viên
                                          if (checkScheduleConflict(schedule, senderSchedule, selectedCurrentScheduleId)) {
                                            return false;
                                          }
                                          
                                          return true;
                                        })
                                      : [];

                                    if (!selectedCurrentScheduleId || currentSessionOrder === null || currentSessionOrder === undefined) {
                                      return (
                                        <div className="text-neutral-500 text-13">
                                          Vui lòng chọn buổi nghỉ trước
                                        </div>
                                      );
                                    }

                                    if (filteredSchedules.length === 0) {
                                      return (
                                        <div className="text-neutral-500 text-13">
                                          Không có buổi học bù cùng session và sau ngày buổi nghỉ
                                        </div>
                                      );
                                    }

                                    return (
                                      <Form.Select
                                        value={selectedMakeupClassInfo.selectedScheduleId || ''}
                                        onChange={(e) => {
                                          // Lưu selectedScheduleId vào selectedMakeupClassInfo
                                          setSelectedMakeupClassInfo({
                                            ...selectedMakeupClassInfo,
                                            selectedScheduleId: e.target.value
                                          });
                                        }}
                                        className="border-neutral-200"
                                        size="sm"
                                      >
                                        <option value="">-- Chọn buổi học --</option>
                                        {filteredSchedules.map((schedule) => {
                                          const scheduleId = schedule.id || schedule._id;
                                          const dateStr = schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : '';
                                          const timeStr = `${schedule.startTime} - ${schedule.endTime}`;
                                          const displayText = `${schedule.title}${dateStr ? ` (${dateStr})` : ''} - ${timeStr}`;
                                          return (
                                            <option key={scheduleId} value={scheduleId}>
                                              {displayText}
                                            </option>
                                          );
                                        })}
                                      </Form.Select>
                                    );
                                  })()}
                                </div>
                                {selectedMakeupClassInfo.selectedScheduleId && selectedMakeupClassInfo.fixedSchedules && (
                                  <>
                                    {(() => {
                                      const selectedSchedule = selectedMakeupClassInfo.fixedSchedules.find(
                                        s => (s.id || s._id) === selectedMakeupClassInfo.selectedScheduleId
                                      );
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
                                              <div className="fw-semibold">{selectedSchedule.roomName || 'N/A'}</div>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </>
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
                  )}

                  {/* Cột phải: Tạo lớp mới - chỉ hiển thị khi chọn new */}
                  {makeupClassOption === 'new' && (
                    <div className="col-md-6">
                      {/* Placeholder - sẽ được thêm sau */}
                    </div>
                  )}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowMakeupClassModal(false);
                  setMakeupClassOption(null);
                  setSelectedCurrentClassId(null);
                  setSelectedCurrentClassInfo(null);
                  setSelectedCurrentScheduleId(null);
                  setSelectedMakeupClassId(null);
                  setSelectedMakeupClassInfo(null);
                  setAvailableMakeupClasses([]);
                }}
              >
                Đóng
              </Button>
              {makeupClassOption === 'existing' && (
                <Button 
                  variant="primary" 
                  disabled={!selectedCurrentScheduleId || !selectedMakeupClassInfo?.selectedScheduleId || processing}
                  onClick={async () => {
                    if (!selectedCurrentScheduleId || !selectedMakeupClassInfo?.selectedScheduleId) {
                      alert('Vui lòng chọn đầy đủ buổi học ở cả 2 cột');
                      return;
                    }

                    try {
                      setProcessing(true);
                      
                      // Lấy thông tin buổi học được chọn (bên phải - buổi sẽ đổi sang)
                      const selectedSchedule = selectedMakeupClassInfo.schedules.find(
                        s => (s.id || s._id) === selectedMakeupClassInfo.selectedScheduleId
                      );

                      if (!selectedSchedule || !selectedSchedule.date || !selectedSchedule.startTime || !selectedSchedule.endTime) {
                        alert('Thông tin buổi học không đầy đủ');
                        setProcessing(false);
                        return;
                      }

                      // Lấy thông tin lớp được chọn (bên phải)
                      const selectedClass = availableMakeupClasses.find(
                        cls => (cls._id || cls) === selectedMakeupClassId
                      );

                      if (!selectedClass || !selectedClass.room) {
                        alert('Thông tin lớp không đầy đủ');
                        setProcessing(false);
                        return;
                      }

                      // Format date thành YYYY-MM-DD
                      const scheduleDate = new Date(selectedSchedule.date);
                      const dateStr = formatDateToYYYYMMDD(scheduleDate);

                      // Kiểm tra conflict
                      const validateData = {
                        classId: selectedMakeupClassId,
                        date: dateStr,
                        startTime: selectedSchedule.startTime,
                        endTime: selectedSchedule.endTime,
                        room: selectedClass.room._id || selectedClass.room
                      };

                      const validateResponse = await classScheduleService.validateAddClassSchedule(validateData);
                      
                      if (!validateResponse.success) {
                        alert(`Lỗi: ${validateResponse.message || 'Không thể kiểm tra xung đột'}`);
                        setProcessing(false);
                        return;
                      }
                      
                      if (validateResponse.hasConflict || (validateResponse.conflicts && (
                        (validateResponse.conflicts.teacher && validateResponse.conflicts.teacher.length > 0) ||
                        (validateResponse.conflicts.room && validateResponse.conflicts.room.length > 0) ||
                        (validateResponse.conflicts.students && validateResponse.conflicts.students.length > 0)
                      ))) {
                        // Hiển thị thông báo conflict
                        let conflictMessages = [];
                        if (validateResponse.conflicts) {
                          if (validateResponse.conflicts.teacher && validateResponse.conflicts.teacher.length > 0) {
                            const teacherConflicts = validateResponse.conflicts.teacher.map(c => 
                              `Lớp ${c.className} vào ${c.time}`
                            );
                            conflictMessages.push(`Giảng viên: ${teacherConflicts.join(', ')}`);
                          }
                          if (validateResponse.conflicts.room && validateResponse.conflicts.room.length > 0) {
                            const roomConflicts = validateResponse.conflicts.room.map(c => 
                              `Lớp ${c.className} vào ${c.time}`
                            );
                            conflictMessages.push(`Phòng học: ${roomConflicts.join(', ')}`);
                          }
                          if (validateResponse.conflicts.students && validateResponse.conflicts.students.length > 0) {
                            const studentConflicts = validateResponse.conflicts.students.map(c => 
                              `${c.studentName || 'Học sinh'} - Lớp ${c.className} vào ${c.time}`
                            );
                            conflictMessages.push(`Học sinh: ${studentConflicts.join(', ')}`);
                          }
                        }
                        
                        const message = conflictMessages.length > 0 
                          ? `⚠️ Có xung đột lịch học:\n\n${conflictMessages.join('\n')}\n\nBạn có muốn tiếp tục không?`
                          : '⚠️ Có xung đột lịch học. Bạn có muốn tiếp tục không?';
                        
                        const shouldContinue = window.confirm(message);
                        if (!shouldContinue) {
                          setProcessing(false);
                          return;
                        }
                      }

                      // Lấy thông tin buổi nghỉ đã chọn
                      const absentSchedule = selectedCurrentClassInfo.schedules.find(
                        s => (s.id || s._id) === selectedCurrentScheduleId
                      );

                      if (!absentSchedule) {
                        alert('Không tìm thấy thông tin buổi nghỉ');
                        setProcessing(false);
                        return;
                      }

                      // Lấy thông tin buổi học bù từ fixedSchedules
                      const makeupSchedule = selectedMakeupClassInfo.fixedSchedules.find(
                        s => (s.id || s._id) === selectedMakeupClassInfo.selectedScheduleId
                      );

                      if (!makeupSchedule) {
                        alert('Không tìm thấy thông tin buổi học bù');
                        setProcessing(false);
                        return;
                      }

                      // Lưu thông tin buổi học bù vào state
                      const newMakeupEntry = {
                        absentScheduleId: selectedCurrentScheduleId,
                        absentSchedule: absentSchedule,
                        absentClassId: selectedCurrentClassId,
                        absentClassInfo: selectedCurrentClassInfo,
                        makeupScheduleId: selectedMakeupClassInfo.selectedScheduleId,
                        makeupSchedule: makeupSchedule,
                        makeupClassId: selectedMakeupClassId,
                        makeupClassInfo: selectedMakeupClassInfo
                      };

                      // Thêm vào danh sách pending makeup classes
                      setPendingMakeupClasses(prev => [...prev, newMakeupEntry]);

                      // Đóng modal và reset các state liên quan
                      setShowMakeupClassModal(false);
                      setMakeupClassOption(null);
                      setSelectedCurrentClassId(null);
                      setSelectedCurrentClassInfo(null);
                      setSelectedCurrentScheduleId(null);
                      setSelectedMakeupClassId(null);
                      setSelectedMakeupClassInfo(null);
                      setAvailableMakeupClasses([]);
                      
                    } catch (err) {
                      console.error('Error validating makeup session:', err);
                      const errorMessage = err.message || err.response?.data?.message || 'Không thể kiểm tra xung đột lịch học';
                      alert(`Lỗi: ${errorMessage}`);
                    } finally {
                      setProcessing(false);
                    }
                  }}
                >
                  {processing ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
              )}
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default RequestManagementPage;

