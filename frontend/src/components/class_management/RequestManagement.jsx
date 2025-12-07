import React, { useState, useEffect, useRef } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import changeRequestService from '../../services/changeRequestService';
import academicStaffService from '../../services/academicStaffService';
import classService from '../../services/classService';
import RequestStats from './RequestStats';
import RequestFilters from './RequestFilters';
import RequestTable from './RequestTable';
import RejectRequestModal from './RejectRequestModal';
import ChangeClassModal from './ChangeClassModal';
import MakeupClassModalForAcademicStaff from './MakeupClassModalForAcademicStaff';
import RequestDetailPage from '../../pages/AcademicStaff/RequestDetailPage';
import { formatDate, naturalCompare } from '../../utils/requestHelpers';

/**
 * RequestManagement Component
 * Component chính quản lý đơn xin đổi buổi/lớp học
 */
const RequestManagement = () => {
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    createClass: 0,
    changeClass: 0,
    makeupClass: 0,
    replaceTeacher: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
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

  // Fetch requests when filters change
  useEffect(() => {
    fetchChangeRequests();
  }, [page, debouncedSearchTerm, filterStatus, filterType, sortBy]);

  // Fetch stats separately
  useEffect(() => {
    fetchStats();
  }, [filterStatus]);

  const fetchStats = async () => {
    try {
      const params = {};
      if (filterStatus && filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      const response = await changeRequestService.getStats(params);
      if (response.success && response.stats) {
        setStats({
          pending: response.stats.pending || 0,
          approved: response.stats.approved || 0,
          rejected: response.stats.rejected || 0,
          createClass: response.stats.createClass || 0,
          changeClass: response.stats.changeClass || 0,
          makeupClass: response.stats.makeupClass || 0,
          replaceTeacher: response.stats.replaceTeacher || 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For sender sorting, we need to handle it on frontend after fetching
      // because MongoDB can't sort by populated fields
      const needsSenderSort = sortBy === 'sender' || sortBy === 'sender-desc';
      const backendSortBy = needsSenderSort ? 'oldest' : sortBy;
      
      const params = {
        page,
        limit: 10,
        sortBy: backendSortBy
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      if (filterType && filterType !== 'all') params.type = filterType;
      
      const response = await changeRequestService.getAllChangeRequests(params);
      if (response.success) {
        let requests = response.changeRequests || [];
        
        // Sort by sender on frontend if needed
        if (needsSenderSort) {
          requests = [...requests].sort((a, b) => {
            const nameA = a.sender?.username || a.sender?.fullName || a.sender?.name || '';
            const nameB = b.sender?.username || b.sender?.fullName || b.sender?.name || '';
            const comparison = naturalCompare(nameA, nameB);
            return sortBy === 'sender-desc' ? -comparison : comparison;
          });
        }
        
        setChangeRequests(requests);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 1);
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

  const handleRejectClick = (request) => {
    setRequestToReject(request);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      
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
        } : null
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
      fetchChangeRequests();
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
      fetchChangeRequests();
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

  return (
    <Container fluid className="p-24">
      {/* Header */}
      <div className="mb-24">
        <h4 className="text-neutral-900 fw-bold mb-8">Quản lý đơn</h4>
        <p className="text-neutral-600 mb-0">Quản lý đơn xin đổi buổi/lớp học từ học viên và giảng viên</p>
      </div>

      {/* Stats Cards */}
      <RequestStats
        stats={stats}
        filterType={filterType}
        onFilterTypeChange={(type) => {
          setFilterType(type);
          setPage(1);
        }}
      />

      {/* Filters */}
      <RequestFilters
        searchTerm={searchTerm}
        filterStatus={filterStatus}
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

      {/* Table */}
      {!loading && !error && (
        <RequestTable
          requests={changeRequests}
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

