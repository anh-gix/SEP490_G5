import React, { useState, useEffect, useMemo } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import changeRequestService from '../../services/changeRequestService';
import academicStaffService from '../../services/academicStaffService';
import classService from '../../services/classService';
import { naturalCompare } from '../../utils/requestHelpers';
import RequestStats from './RequestStats';
import RequestFilters from './RequestFilters';
import RequestTable from './RequestTable';
import RejectRequestModal from './RejectRequestModal';
import ChangeClassModal from './ChangeClassModal';
import RequestDetailPage from '../../pages/AcademicStaff/RequestDetailPage';
import { formatDate } from '../../utils/requestHelpers';

/**
 * RequestManagement Component
 * Component chính quản lý đơn xin đổi buổi/lớp học
 */
const RequestManagement = () => {
  const [changeRequests, setChangeRequests] = useState([]);
  const [allChangeRequests, setAllChangeRequests] = useState([]);
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

  // Fetch requests when filters change
  useEffect(() => {
    fetchChangeRequests();
  }, [page, searchTerm, filterStatus, filterType]);

  // Fetch stats separately
  useEffect(() => {
    fetchStats();
  }, [filterStatus]);

  // Sort requests
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

  const fetchStats = async () => {
    try {
      const params = { limit: 10000 };
      if (filterStatus && filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      const response = await changeRequestService.getAllChangeRequests(params);
      if (response.success) {
        const requests = response.changeRequests || [];
        
        setStats({
          pending: requests.filter(r => r.status === 'pending').length,
          approved: requests.filter(r => r.status === 'approved').length,
          rejected: requests.filter(r => r.status === 'rejected').length,
          createClass: requests.filter(r => r.type === 'create_class').length,
          changeClass: requests.filter(r => r.type === 'change_class').length,
          makeupClass: requests.filter(r => r.type === 'makeup_class').length,
          replaceTeacher: requests.filter(r => r.type === 'replace_teacher').length
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
      const params = { limit: 10000 };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      if (filterType && filterType !== 'all') params.type = filterType;
      
      const response = await changeRequestService.getAllChangeRequests(params);
      if (response.success) {
        const requests = response.changeRequests || [];
        setAllChangeRequests(requests);
        setTotal(requests.length);
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

      courseId = classSchedules[0]?.class?.course?._id || classSchedules[0]?.class?.course || null;
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

      courseId = classItem.courseId || null;
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

    setSelectedClassToChange(currentClassInfo);
    setShowChangeClassModal(true);
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
          // TODO: Implement MakeupClassModal component
          // The MakeupClassModal is very complex (~1200 lines) and needs to be refactored separately
          // For now, this is a placeholder - the functionality should be restored in a future refactoring
          toast.info('Chức năng thêm buổi học bù đang được refactor. Vui lòng quay lại sau.');
        }}
        onRemoveMakeupClass={handleRemoveMakeupClass}
        onRemoveClassChange={handleRemoveClassChange}
        processing={processing}
        formatDate={formatDate}
        renderClassInfo={renderClassInfo}
      />
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
          setPage(1);
        }}
        onFilterStatusChange={(value) => {
          setFilterStatus(value);
          setPage(1);
        }}
        onSortChange={setSortBy}
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

