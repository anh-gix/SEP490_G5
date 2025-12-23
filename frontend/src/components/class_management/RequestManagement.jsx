import React, { useState, useEffect, useRef } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import changeRequestService from '../../services/changeRequestService';
import academicStaffService from '../../services/academicStaffService';
import academicWorkRequestService from '../../services/academicWorkRequestService';
import classService from '../../services/classService';
import { useAuth } from '../../contexts/AuthContext';
import RequestStats from './RequestStats';
import RequestFilters from './RequestFilters';
import RequestTable from './RequestTable';
import RejectRequestModal from './RejectRequestModal';
import MakeupClassRequestModal from './MakeupClassRequestModal';
import RequestDetailPage from './RequestDetailPage';
import WorkRequestDetail from './WorkRequestDetail';
import { formatDate, naturalCompare } from '../../utils/requestHelpers';

/**
 * RequestManagement Component
 * Component chính quản lý đơn xin đổi buổi/lớp học
 */
const RequestManagement = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [pendingMakeupClasses, setPendingMakeupClasses] = useState([]);
  const [pendingMakeupSessions, setPendingMakeupSessions] = useState([]);
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [selectedStudentScheduleId, setSelectedStudentScheduleId] = useState(null);
  const searchTimeoutRef = useRef(null);
  const [loadingRequestById, setLoadingRequestById] = useState(false);

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
    } else {
    }
  }, [user, page, debouncedSearchTerm, filterStatus, filterType, sortBy]);

  // Fetch stats separately
  useEffect(() => {
    if (user?._id) {
      fetchStats();
    } else {
    }
  }, [user, filterStatus]);

  // Handle requestId from URL query parameter - call immediately on mount
  useEffect(() => {
    const requestId = searchParams.get('requestId');
    if (requestId && user?._id && !loadingRequestById) {
      // Call immediately, don't wait for list to load
      handleOpenRequestById(requestId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user]); // Remove loading from dependencies


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
        
        const newStats = {
          pending: (changeStats.pending || 0) + (workStats.pending || 0),
          approved: changeStats.approved || 0,
          rejected: (changeStats.rejected || 0) + (workStats.rejected || 0),
          makeupClass: changeStats.makeupClass || 0,
          requestReplaceTeacher: changeStats.requestReplaceTeacher || 0,
          assignStudents: workStats.assign_students || 0
        };
        setStats(newStats);
      }
    } catch (err) {
      // Error handling - keep silent or use non-debug logging if needed
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
    status: req.status,
    // Map handler and handled date for work requests
    approver: source === 'changeRequest' ? req.approver : req.processedBy,
    approvedDate: source === 'changeRequest' ? req.approvedDate : req.processedAt
  });

  // Helper function to open request detail
  const openRequestDetail = async (request) => {
    if (request._source === 'workRequest') {
      // Show WorkRequest detail
      setSelectedRequest(request);
      setShowWorkRequestDetail(true);
    } else {
      // Show ChangeRequest detail - optimized for better UX
      // Set request and show modal immediately for instant feedback
      setSelectedRequest(request);
      setShowDetailModal(true);
      setRejectReason('');
      setLoadingSchedule(true);
      setSenderSchedule([]);
      setSenderRole(null);
      
      // Fetch schedule immediately without blocking (non-blocking)
      // This allows the modal to show immediately while schedule loads in background
      changeRequestService.getSenderSchedule(request._id)
        .then((response) => {
          if (response.success) {
            setSenderSchedule(response.schedules || []);
            setSenderRole(response.sender?.role || null);
          }
        })
        .catch((err) => {
          console.error('Error fetching schedule:', err);
          setSenderSchedule([]);
          setSenderRole(null);
        })
        .finally(() => {
          setLoadingSchedule(false);
        });
    }
  };

  // Function to fetch and open request by ID
  const handleOpenRequestById = async (requestId) => {
    if (!requestId) return;
    
    try {
      setLoadingRequestById(true);
      
      // Step 1: Try to find in already loaded requests first (fastest)
      const foundInMerged = mergedRequests.find(req => req._id === requestId);
      if (foundInMerged) {
        // Request already loaded, just open it
        await openRequestDetail(foundInMerged);
        // Remove query parameter
        searchParams.delete('requestId');
        setSearchParams(searchParams, { replace: true });
        setLoadingRequestById(false);
        return;
      }

      // Step 2: Try to fetch as WorkRequest first (has fast getById endpoint)
      try {
        const workResponse = await academicWorkRequestService.getRequestById(requestId);
        if (workResponse.success && workResponse.data) {
          const workReq = normalizeRequest(workResponse.data, 'workRequest');
          await openRequestDetail(workReq);
          // Remove query parameter
          searchParams.delete('requestId');
          setSearchParams(searchParams, { replace: true });
          setLoadingRequestById(false);
          return;
        }
      } catch (err) {
        // Not a WorkRequest or not found, continue to try ChangeRequest
      }

      // Step 3: Try to fetch as ChangeRequest (slower, requires fetching all)
      // Only fetch a reasonable limit instead of 10000
      try {
        const changeResponse = await changeRequestService.getAllChangeRequests({ 
          limit: 100,  // Reduced from 10000 for better performance
          page: 1
        });
        if (changeResponse.success) {
          const changeReqs = (changeResponse.changeRequests || []).map(req => 
            normalizeRequest(req, 'changeRequest')
          );
          const foundRequest = changeReqs.find(req => req._id === requestId);
          
          if (foundRequest) {
            await openRequestDetail(foundRequest);
            // Remove query parameter
            searchParams.delete('requestId');
            setSearchParams(searchParams, { replace: true });
            setLoadingRequestById(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching change request:', err);
      }

      // If not found, show error
      toast.error('Không tìm thấy đơn với ID này');
      searchParams.delete('requestId');
      setSearchParams(searchParams, { replace: true });
      
    } catch (error) {
      console.error('Error opening request by ID:', error);
      toast.error('Có lỗi xảy ra khi mở đơn');
      searchParams.delete('requestId');
      setSearchParams(searchParams, { replace: true });
    } finally {
      setLoadingRequestById(false);
    }
  };

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
          ['makeup_class', 'request_replace_teacher'].includes(filterType)) {
        changeParams.type = filterType;
      }
      
      const workParams = { userId: user._id };
      if (filterStatus && filterStatus !== 'all') workParams.status = filterStatus;
      
      // Always filter assign_students requests for academic staff
      if (filterType === 'assign_students' || !filterType || filterType === 'all') {
        workParams.requestType = 'assign_students';
      }
      
      // Fetch both ChangeRequests and WorkRequests in parallel
      const [changeResponse, workResponse] = await Promise.all([
        changeRequestService.getAllChangeRequests(changeParams).catch(err => {
          throw err;
        }),
        academicWorkRequestService.getAssignedRequests(workParams).catch(err => {
          throw err;
        })
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
        } else if (filterType && ['makeup_class', 'request_replace_teacher'].includes(filterType)) {
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

        // Calculate total from backend responses
        let totalFromBackend = 0;

        // Add ChangeRequest total if showing ChangeRequests
        if (filterType !== 'assign_students') {
          totalFromBackend += changeResponse.total || 0;
        }

        // Add WorkRequest total if showing WorkRequests
        if (!filterType || filterType === 'all' || filterType === 'assign_students') {
          totalFromBackend += workReqs.length; // WorkRequests don't have pagination
        }

        setTotal(totalFromBackend);
        setTotalPages(Math.ceil(totalFromBackend / 10));
      } else {
        setError('Không thể tải danh sách đơn');
      }
    } catch (err) {
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
        responseContent: responseContent
      };
      
      await academicStaffService.approveChangeRequest(selectedRequest._id, approvalData);
      toast.success('Chấp nhận đơn thành công!');
      setShowDetailModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      setSenderSchedule([]);
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

  const handleRemoveMakeupClass = (index) => {
    if (index < 0 || index >= pendingMakeupClasses.length) return;
    setPendingMakeupClasses(prev => {
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
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

  // If showing detail modal, render RequestDetailPage
  if (showDetailModal && selectedRequest) {
    return (
      <>
        <RequestDetailPage
          selectedRequest={selectedRequest}
          senderSchedule={senderSchedule}
          senderRole={senderRole}
          loadingSchedule={loadingSchedule}
          pendingMakeupClasses={pendingMakeupClasses}
          pendingMakeupSessions={pendingMakeupSessions}
          onBack={() => {
            setShowDetailModal(false);
            setRejectReason('');
            setSelectedRequest(null);
            setSenderSchedule([]);
            setSenderRole(null);
            setPendingMakeupClasses([]);
            setPendingMakeupSessions([]);
            setShowMakeupModal(false);
            setSelectedStudentScheduleId(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onAddMakeupClass={(studentScheduleId) => {
            setSelectedStudentScheduleId(studentScheduleId);
            setShowMakeupModal(true);
          }}
          onRemoveMakeupClass={handleRemoveMakeupClass}
          processing={processing}
          formatDate={formatDate}
        />
        {/* Makeup Class Modal - render here so it's available when detail page is shown */}
        <MakeupClassRequestModal
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

  // Early return: Show loading overlay immediately if requestId exists and we're fetching
  const requestId = searchParams.get('requestId');
  if (requestId && (loadingRequestById || (loading && user?._id))) {
    return (
      <Container fluid className="p-24" style={{ position: 'relative' }}>
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Spinner animation="border" variant="primary" />
            <p className="text-neutral-700 mb-0 fw-medium">Đang tải chi tiết đơn...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-24" style={{ position: 'relative' }}>
      {/* Loading overlay when fetching request by ID */}
      {loadingRequestById && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Spinner animation="border" variant="primary" />
            <p className="text-neutral-700 mb-0 fw-medium">Đang tải chi tiết đơn...</p>
          </div>
        </div>
      )}

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
          // Bỏ dòng này: setFilterStatus('all'); // Reset status when changing type
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

    </Container>
  );
};

export default RequestManagement;

