import React, { useState, useEffect, useRef } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import changeRequestService from '../../services/changeRequestService';
import academicStaffService from '../../services/academicStaffService';
import academicWorkRequestService from '../../services/academicWorkRequestService';
import classService from '../../services/classService';
import { useAuth } from '../../contexts/AuthContext';
import RequestStats from './RequestStats';
import RequestFilters from './RequestFilters';
import RequestTable from './RequestTable';
import RejectRequestModal from './RejectRequestModal';
import ChangeClassModal from './ChangeClassModal';
import MakeupClassModalForAcademicStaff from './MakeupClassModalForAcademicStaff';
import RequestDetailPage from '../../pages/AcademicStaff/RequestDetailPage';
import WorkRequestDetail from '../AcademicStaff/WorkRequestDetail';
import { formatDate, naturalCompare } from '../../utils/requestHelpers';

/**
 * RequestManagement Component
 * Component chính quản lý đơn xin đổi buổi/lớp học
 */
const RequestManagement = () => {
  const { user } = useAuth();
  const [changeRequests, setChangeRequests] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);
  const [mergedRequests, setMergedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    changeClass: 0,
    makeupClass: 0,
    requestReplaceTeacher: 0,
    assignStudents: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('oldest');
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
  const [pendingClassChange, setPendingClassChange] = useState(null);
  const [pendingMakeupClasses, setPendingMakeupClasses] = useState([]);
  const [pendingMakeupSessions, setPendingMakeupSessions] = useState([]);
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [selectedStudentScheduleId, setSelectedStudentScheduleId] = useState(null);
  const searchTimeoutRef = useRef(null);

  // WorkRequest detail state
  const [showWorkRequestDetail, setShowWorkRequestDetail] = useState(false);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch both ChangeRequests and WorkRequests when filters change
  useEffect(() => {
    if (user?._id) {
      fetchAllRequests();
    }
  }, [user, page, debouncedSearchTerm, filterStatus, filterType, sortBy]);

  // Fetch stats separately
  useEffect(() => {
    if (user?._id) {
      fetchStats();
    }
  }, [user, filterStatus]);

  const fetchStats = async () => {
    try {
      const params = {};
      if (filterStatus && filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      // Fetch ChangeRequest stats
      const changeResponse = await changeRequestService.getStats(params);
      
      // Fetch WorkRequest stats
      const workParams = { userId: user._id };
      if (filterStatus && filterStatus !== 'all') {
        workParams.status = filterStatus;
      }
      const workResponse = await academicWorkRequestService.getStats(workParams);
      
      if (changeResponse.success && workResponse.success) {
        const changeStats = changeResponse.stats || {};
        const workStats = workResponse.stats || {};
        
        setStats({
          pending: (changeStats.pending || 0) + (workStats.pending || 0),
          approved: changeStats.approved || 0,
          rejected: (changeStats.rejected || 0) + (workStats.rejected || 0),
          changeClass: changeStats.changeClass || 0,
          makeupClass: changeStats.makeupClass || 0,
          requestReplaceTeacher: changeStats.requestReplaceTeacher || 0,
          assignStudents: workStats.assign_students || 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Normalize request data structure
  const normalizeRequest = (req, source) => ({
    ...req,
    _source: source,
    _id: req._id,
    type: source === 'changeRequest' ? req.type : req.requestType,
    createdAt: source === 'changeRequest' ? req.createdAt : req.requestedAt,
    sender: source === 'changeRequest' ? req.sender : req.requestedBy,
    content: source === 'changeRequest' ? req.content : req.requestNote,
    status: req.status
  });

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For sender sorting, we need to handle it on frontend after fetching
      const needsSenderSort = sortBy === 'sender' || sortBy === 'sender-desc';
      const backendSortBy = needsSenderSort ? 'oldest' : sortBy;
      
      const changeParams = {
        page,
        limit: 10,
        sortBy: backendSortBy
      };
      if (debouncedSearchTerm) changeParams.search = debouncedSearchTerm;
      if (filterStatus && filterStatus !== 'all') changeParams.status = filterStatus;
      
      // Only filter by ChangeRequest types or fetch all if 'all' or WorkRequest type
      if (filterType && filterType !== 'all' && 
          ['change_class', 'makeup_class', 'request_replace_teacher'].includes(filterType)) {
        changeParams.type = filterType;
      }
      
      const workParams = { userId: user._id };
      if (filterStatus && filterStatus !== 'all') workParams.status = filterStatus;
      
      // Fetch both ChangeRequests and WorkRequests in parallel
      const [changeResponse, workResponse] = await Promise.all([
        changeRequestService.getAllChangeRequests(changeParams),
        academicWorkRequestService.getAssignedRequests(workParams)
      ]);
      
      if (changeResponse.success && workResponse.success) {
        let changeReqs = (changeResponse.changeRequests || []).map(req => 
          normalizeRequest(req, 'changeRequest')
        );
        let workReqs = (workResponse.data || []).map(req => 
          normalizeRequest(req, 'workRequest')
        );
        
        // Filter by type if needed (for WorkRequest types)
        if (filterType && filterType === 'assign_students') {
          workReqs = workReqs.filter(req => req.requestType === 'assign_students');
          changeReqs = []; // Don't show ChangeRequests
        } else if (filterType && ['change_class', 'makeup_class', 'request_replace_teacher'].includes(filterType)) {
          workReqs = []; // Don't show WorkRequests
        }
        
        // Filter by search term
        if (debouncedSearchTerm) {
          const searchLower = debouncedSearchTerm.toLowerCase();
          workReqs = workReqs.filter(req => {
            const content = (req.content || '').toLowerCase();
            const sender = (req.sender?.username || '').toLowerCase();
            return content.includes(searchLower) || sender.includes(searchLower);
          });
        }
        
        // Merge requests
        let merged = [...changeReqs, ...workReqs];
        
        // Sort by sender on frontend if needed
        if (needsSenderSort) {
          merged = merged.sort((a, b) => {
            const nameA = a.sender?.username || a.sender?.fullName || a.sender?.name || '';
            const nameB = b.sender?.username || b.sender?.fullName || b.sender?.name || '';
            const comparison = naturalCompare(nameA, nameB);
            return sortBy === 'sender-desc' ? -comparison : comparison;
          });
        } else if (sortBy === 'newest') {
          merged = merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'oldest') {
          merged = merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        
        setChangeRequests(changeReqs);
        setWorkRequests(workReqs);
        setMergedRequests(merged);
        setTotal(merged.length);
        setTotalPages(Math.ceil(merged.length / 10));
      } else {
        setError('Không thể tải danh sách đơn');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = async (request) => {
    // Check if this is a WorkRequest or ChangeRequest
    if (request._source === 'workRequest') {
      // Show WorkRequest detail
      setSelectedRequest(request);
      setShowWorkRequestDetail(true);
    } else {
      // Show ChangeRequest detail (existing flow)
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
    }
  };

  const handleRejectClick = (request) => {
    setRequestToReject(request);
    setShowRejectModal(true);
    setRejectReason('');
  };

  // Helper function to format date for display
  const formatDateForResponse = (dateString) => {
    if (!dateString) return '';
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1;
      const day = parseInt(dateMatch[3], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Generate response content automatically
  const generateResponseContent = () => {
    const parts = [];
    
    // Handle makeup classes
    if (pendingMakeupClasses && pendingMakeupClasses.length > 0) {
      pendingMakeupClasses.forEach((makeup) => {
        // Get absent date and time - try multiple sources
        let absentDate = '';
        let absentTime = '';
        
        // Try 1: Find from senderSchedule
        const absentSchedule = senderSchedule.find(sch => {
          const schId = sch.studentScheduleId || sch._id || sch.id;
          const absentId = makeup.absentScheduleId?.toString();
          if (!schId || !absentId) return false;
          return schId.toString() === absentId;
        });
        
        if (absentSchedule) {
          absentDate = formatDateForResponse(absentSchedule.date);
          absentTime = absentSchedule.startTime && absentSchedule.endTime
            ? `${absentSchedule.startTime} - ${absentSchedule.endTime}`
            : '';
        } else if (makeup.absentSchedule?.date) {
          // Try 2: From makeup.absentSchedule
          absentDate = formatDateForResponse(makeup.absentSchedule.date);
          absentTime = makeup.absentSchedule.startTime && makeup.absentSchedule.endTime
            ? `${makeup.absentSchedule.startTime} - ${makeup.absentSchedule.endTime}`
            : '';
        }
        
        // Try 3: From selectedRequest (for makeup_class type)
        if (!absentDate && selectedRequest?.studentScheduleId) {
          const studentSchedule = selectedRequest.studentScheduleId;
          const classSchedule = studentSchedule?.classSchedule;
          if (classSchedule?.date) {
            absentDate = formatDateForResponse(classSchedule.date);
            absentTime = classSchedule.startTime && classSchedule.endTime
              ? `${classSchedule.startTime} - ${classSchedule.endTime}`
              : '';
          }
        }
        
        // Try 4: Search in all senderSchedule items by matching IDs more flexibly
        if (!absentDate && senderSchedule.length > 0) {
          const absentId = makeup.absentScheduleId?.toString();
          for (const sch of senderSchedule) {
            // Try different ID fields
            const possibleIds = [
              sch.studentScheduleId,
              sch._id,
              sch.id,
              sch.classSchedule?._id,
              sch.classSchedule?.id
            ].filter(Boolean).map(id => id?.toString());
            
            if (possibleIds.includes(absentId)) {
              absentDate = formatDateForResponse(sch.date);
              absentTime = sch.startTime && sch.endTime
                ? `${sch.startTime} - ${sch.endTime}`
                : '';
              break;
            }
          }
        }
        
        // Get makeup schedule info
        let makeupDate = '';
        let makeupTime = '';
        
        if (makeup.isSubstituteClass && makeup.substituteTeacherInfo) {
          // Giáo viên dạy thay
          const teacherName = makeup.substituteTeacherInfo.username || 
                             makeup.substituteTeacherInfo.fullName || 
                             makeup.substituteTeacherInfo.name || 
                             'giáo viên';
          
          // Try to get date from selectedRequest.classScheduleId for request_replace_teacher
          if (!absentDate && selectedRequest?.classScheduleId) {
            const classSchedule = selectedRequest.classScheduleId;
            if (classSchedule?.date) {
              absentDate = formatDateForResponse(classSchedule.date);
              absentTime = classSchedule.startTime && classSchedule.endTime
                ? `${classSchedule.startTime} - ${classSchedule.endTime}`
                : '';
            }
          }
          
          parts.push(`Đã xếp ${teacherName} dạy thay cho buổi học ngày ${absentDate || 'N/A'}${absentTime ? ` (${absentTime})` : ''}`);
        } else if (makeup.isNewMakeup) {
          // Buổi học bù mới
          makeupDate = formatDateForResponse(makeup.newMakeupDate);
          makeupTime = makeup.newMakeupStartTime && makeup.newMakeupEndTime
            ? `${makeup.newMakeupStartTime} - ${makeup.newMakeupEndTime}`
            : '';
          if (absentDate && makeupDate) {
            parts.push(`Đã chuyển buổi học ngày ${absentDate}${absentTime ? ` (${absentTime})` : ''} sang buổi học bù ngày ${makeupDate}${makeupTime ? ` (${makeupTime})` : ''}`);
          }
        } else if (makeup.makeupSchedule) {
          // Buổi học bù từ schedule có sẵn
          makeupDate = formatDateForResponse(makeup.makeupSchedule.date);
          makeupTime = makeup.makeupSchedule.startTime && makeup.makeupSchedule.endTime
            ? `${makeup.makeupSchedule.startTime} - ${makeup.makeupSchedule.endTime}`
            : '';
          if (absentDate && makeupDate) {
            parts.push(`Đã chuyển buổi học ngày ${absentDate}${absentTime ? ` (${absentTime})` : ''} sang buổi học bù ngày ${makeupDate}${makeupTime ? ` (${makeupTime})` : ''}`);
          }
        }
      });
    }
    
    // Handle class change
    if (pendingClassChange) {
      const oldClassName = pendingClassChange.oldClassInfo?.className || pendingClassChange.oldClassInfo?.name || 'N/A';
      const newClassName = pendingClassChange.newClassInfo?.className || pendingClassChange.newClassInfo?.name || 'N/A';
      parts.push(`Đã chuyển từ lớp ${oldClassName} sang lớp ${newClassName}`);
    }
    
    return parts.length > 0 ? parts.join('. ') : 'Đã chấp nhận đơn';
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      
      // Generate response content automatically
      const responseContent = generateResponseContent();
      
      const approvalData = {
        pendingMakeupClasses: pendingMakeupClasses.map(makeup => ({
          absentScheduleId: makeup.absentScheduleId,
          makeupScheduleId: makeup.makeupScheduleId,
          makeupClassId: makeup.makeupClassId,
          isSubstituteClass: makeup.isSubstituteClass || false,
          substituteTeacherId: makeup.substituteTeacherId || null,
          isNewMakeup: makeup.isNewMakeup || false,
          newMakeupDate: makeup.newMakeupDate || null,
          newMakeupStartTime: makeup.newMakeupStartTime || null,
          newMakeupEndTime: makeup.newMakeupEndTime || null,
          newMakeupRoomId: makeup.newMakeupRoomId || null,
          newMakeupTeacherId: makeup.newMakeupTeacherId || null,
          newMakeupSessionId: makeup.newMakeupSessionId || null
        })),
        pendingClassChange: pendingClassChange ? {
          oldClassId: pendingClassChange.oldClassId,
          newClassId: pendingClassChange.newClassId
        } : null,
        responseContent: responseContent
      };
      
      await academicStaffService.approveChangeRequest(selectedRequest._id, approvalData);
      toast.success('Chấp nhận đơn thành công!');
      setShowDetailModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      setSenderSchedule([]);
      setPendingClassChange(null);
      setPendingMakeupClasses([]);
      setPendingMakeupSessions([]);
      fetchAllRequests();
      fetchStats();
    } catch (err) {
      console.error('Error approving request:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi chấp nhận đơn');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (rejectReasonParam = null) => {
    if (!selectedRequest && !requestToReject) return;
    const request = selectedRequest || requestToReject;
    
    try {
      setProcessing(true);
      await academicStaffService.rejectChangeRequest(request._id, rejectReasonParam || rejectReason || null);
      toast.success('Từ chối đơn thành công!');
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
      fetchAllRequests();
      fetchStats();
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi từ chối đơn');
    } finally {
      setProcessing(false);
    }
  };

  const handleChangeClassClick = async (classItem) => {
    try {
      console.log(' handleChangeClassClick called', { classItem });
      
      if (!classItem) {
        console.error(' classItem is undefined');
        toast.error('Không tìm thấy thông tin lớp học');
        return;
      }

      const classSchedules = senderSchedule.filter(sch => {
        const classId = sch.class?._id?.toString() || sch.class?.toString();
        const targetClassId = (classItem.classId?._id?.toString() || classItem.classId?.toString() || String(classItem.classId));
        return classId === targetClassId;
      });

      let fixedSchedulesList = [];
      let courseId = null;

      if (classSchedules.length > 0) {
        const fixedSchedules = classSchedules.filter(sch => {
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

        // Extract courseId - xử lý cả object và ObjectId string
        const courseInfo = classSchedules[0]?.class?.course;
        if (courseInfo) {
          if (typeof courseInfo === 'object' && courseInfo._id) {
            courseId = courseInfo._id.toString();
          } else if (typeof courseInfo === 'string') {
            courseId = courseInfo;
          } else if (courseInfo && typeof courseInfo === 'object' && courseInfo.toString) {
            courseId = courseInfo.toString();
          }
        }
      } else if (classItem.fixedSchedules && Array.isArray(classItem.fixedSchedules) && classItem.fixedSchedules.length > 0) {
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

        // Extract courseId từ classItem - xử lý cả object và ObjectId string
        if (classItem.courseId) {
          if (typeof classItem.courseId === 'object' && classItem.courseId._id) {
            courseId = classItem.courseId._id.toString();
          } else if (typeof classItem.courseId === 'string') {
            courseId = classItem.courseId;
          } else if (classItem.courseId && typeof classItem.courseId === 'object' && classItem.courseId.toString) {
            courseId = classItem.courseId.toString();
          }
        }
      }

      if (!courseId) {
        console.error(' courseId is null or undefined', { classItem, classSchedules });
        toast.error('Không tìm thấy thông tin khóa học. Vui lòng thử lại sau.');
        return;
      }

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

      console.log(' Opening ChangeClassModal', { currentClassInfo });
      setSelectedClassToChange(currentClassInfo);
      setShowChangeClassModal(true);
    } catch (error) {
      console.error(' Error in handleChangeClassClick:', error);
      toast.error('Có lỗi xảy ra khi mở form đổi lớp. Vui lòng thử lại.');
    }
  };

  const handleChangeClassConfirm = (data) => {
    setPendingClassChange({
      oldClassId: data.oldClassId,
      newClassId: data.newClassId,
      oldClassInfo: data.oldClassInfo,
      newClassInfo: data.newClassInfo
    });
    setPendingMakeupSessions(data.makeupSessions || []);
    setShowChangeClassModal(false);
  };

  const handleRemoveMakeupClass = (index) => {
    if (index < 0 || index >= pendingMakeupClasses.length) return;
    setPendingMakeupClasses(prev => {
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  const handleRemoveClassChange = () => {
    setPendingClassChange(null);
  };

  const handleMakeupClassSubmit = (makeupData) => {
    // Add the makeup class data to pendingMakeupClasses
    setPendingMakeupClasses(prev => {
      // Check if this absentScheduleId already exists (for replace_teacher or duplicate)
      const existingIndex = prev.findIndex(m => {
        const existingAbsentId = m.absentScheduleId?.toString();
        const newAbsentId = makeupData.absentScheduleId?.toString();
        return existingAbsentId === newAbsentId;
      });

      if (existingIndex >= 0) {
        // Replace existing entry
        const newList = [...prev];
        newList[existingIndex] = makeupData;
        return newList;
      } else {
        // Add new entry
        return [...prev, makeupData];
      }
    });
    
    // Close modal
    setShowMakeupModal(false);
    setSelectedStudentScheduleId(null);
    toast.success('Đã thêm buổi học bù thành công!');
  };

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
        </div>
      </div>
    );
  };

  // If showing detail modal, render RequestDetailPage
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
            setShowMakeupModal(false);
            setSelectedStudentScheduleId(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onChangeClass={handleChangeClassClick}
          onChangeClassConfirm={handleChangeClassConfirm}
          onAddMakeupClass={(studentScheduleId) => {
            setSelectedStudentScheduleId(studentScheduleId);
            setShowMakeupModal(true);
          }}
          onRemoveMakeupClass={handleRemoveMakeupClass}
          onRemoveClassChange={handleRemoveClassChange}
          processing={processing}
          formatDate={formatDate}
          renderClassInfo={renderClassInfo}
        />
        {/* Makeup Class Modal - render here so it's available when detail page is shown */}
        <MakeupClassModalForAcademicStaff
          show={showMakeupModal}
          studentScheduleId={selectedStudentScheduleId}
          requestType={selectedRequest?.type || 'makeup_class'}
          senderSchedule={senderSchedule}
          onClose={() => {
            setShowMakeupModal(false);
            setSelectedStudentScheduleId(null);
          }}
          onSubmit={handleMakeupClassSubmit}
          loading={processing}
        />
      </>
    );
  }

  // If showing WorkRequest detail, render that instead
  if (showWorkRequestDetail && selectedRequest) {
    return (
      <WorkRequestDetail 
        requestId={selectedRequest._id}
        onBack={() => {
          setShowWorkRequestDetail(false);
          setSelectedRequest(null);
        }}
      />
    );
  }

  return (
    <Container fluid className="p-24">
      {/* Header */}
      <div className="mb-24">
        <h4 className="text-neutral-900 fw-bold mb-8">Quản lý yêu cầu</h4>
        <p className="text-neutral-600 mb-0">Quản lý đơn xin và công việc được giao</p>
      </div>

      {/* Stats Cards */}
      <RequestStats
        stats={stats}
        filterType={filterType}
        onFilterTypeChange={(type) => {
          setFilterType(type);
          setFilterStatus('all'); // Reset status when changing type
          setPage(1);
        }}
      />

      {/* Filters */}
      <RequestFilters
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        filterType={filterType}
        sortBy={sortBy}
        onSearchChange={(value) => {
          setSearchTerm(value);
        }}
        onFilterStatusChange={(value) => {
          setFilterStatus(value);
          setPage(1);
        }}
        onSortChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
      />

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

      {/* Table - showing merged requests */}
      {!loading && !error && (
        <RequestTable
          requests={mergedRequests}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          total={total}
          sortBy={sortBy}
          processing={processing}
          onViewDetails={handleApproveClick}
          onSortChange={setSortBy}
          onPageChange={setPage}
        />
      )}

      {/* Reject Modal */}
      <RejectRequestModal
        show={showRejectModal}
        onHide={() => {
          setShowRejectModal(false);
          setRequestToReject(null);
          setRejectReason('');
        }}
        request={requestToReject}
        rejectReason={rejectReason}
        onRejectReasonChange={setRejectReason}
        onConfirm={() => handleReject()}
        processing={processing}
      />

      {/* Change Class Modal */}
      <ChangeClassModal
        show={showChangeClassModal}
        onHide={() => {
          setShowChangeClassModal(false);
          setSelectedClassToChange(null);
        }}
        selectedClassToChange={selectedClassToChange}
        senderSchedule={senderSchedule}
        onConfirm={handleChangeClassConfirm}
        processing={processing}
      />
    </Container>
  );
};

export default RequestManagement;

