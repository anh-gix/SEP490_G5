import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Pagination, Button, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import ScheduleCalendar from '../../components/class_management/ScheduleCalendar';
import changeRequestService from '../../services/changeRequestService';
import classService from '../../services/classService';
import { formatDateToYYYYMMDD } from '../../helper/helper';

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
    return senderSchedule.map((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = formatDateToYYYYMMDD(scheduleDate);
      
      // Lấy attendance status nếu có
      const attendanceStatus = schedule.attendance?.status || null;
      
      return {
        id: schedule._id || index,
        date: dateStr,
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        className: schedule.class?.name || 'N/A',
        classId: schedule.class?._id || schedule.class || null,
        courseId: schedule.class?.course?._id || schedule.class?.course || null,
        courseName: schedule.class?.course?.name || 'N/A',
        roomName: schedule.room?.room_name || 'N/A',
        topic: schedule.session?.title || schedule.topic || '',
        status: schedule.status === 'fixed' ? 'scheduled' : schedule.status === 'temporary' ? 'makeup' : 'scheduled',
        teacherName: schedule.class?.teacher?.username || 'N/A',
        lessonNumber: schedule.session?.order || '',
        lessonTopic: schedule.session?.title || '',
        sessionName: schedule.session?.title || 'N/A',
        sessionOrder: schedule.session?.order || '',
        attendanceStatus: attendanceStatus, // 'present', 'absent', 'late', 'excused', or null
        hasAttendance: !!attendanceStatus
      };
    });
  }, [senderSchedule]);

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
      roomName: fixedSchedulesList.length > 0 ? fixedSchedulesList[0].roomName : null
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

          setSelectedNewClassInfo({
            className: classData.name || 'N/A',
            courseName: classData.courseName || 'N/A',
            fixedSchedules: fixedSchedulesList,
            studentCount: classData.students?.length || 0,
            roomCapacity: classData.room?.capacity || null
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

          {/* Detail Modal - Chỉ hiển thị khi chấp nhận */}
          <Modal show={showDetailModal} onHide={() => {
            setShowDetailModal(false);
            setRejectReason('');
            setSelectedRequest(null);
            setSenderSchedule([]);
          }} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>Chi tiết đơn - Lịch học/dạy</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                  {selectedRequest && (
                    <div className="mb-16">
                      <p className="text-neutral-700 mb-8">
                        <strong>Người gửi:</strong> {selectedRequest.sender?.username} ({selectedRequest.sender?.email})
                      </p>
                      <p className="text-neutral-700 mb-8">
                        <strong>Ngày gửi:</strong> {formatDate(selectedRequest.createdAt)}
                      </p>
                      <p className="text-neutral-700 mb-16">
                        <strong>Nội dung đơn:</strong> {selectedRequest.content}
                      </p>
                      
                      {/* Danh sách lớp học viên đang học */}
                      {studentClasses.length > 0 && (
                        <div className="mb-16">
                          <h6 className="text-neutral-900 fw-bold mb-12">Các lớp học viên đang học:</h6>
                          <div className="border border-neutral-200 rounded-8 p-12 bg-neutral-25">
                            <div className="d-flex flex-column gap-8">
                              {studentClasses.map((classItem, index) => (
                                <div 
                                  key={index}
                                  className="d-flex align-items-start justify-content-between gap-12 p-12 bg-white rounded-8 border border-neutral-100"
                                >
                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center gap-8 mb-4">
                                      <i className="fas fa-book text-main-600"></i>
                                      <span className="text-neutral-900 fw-semibold text-14">{classItem.className}</span>
                                    </div>
                                    <div className="ps-20 mb-4">
                                      <span className="text-neutral-600 text-13">Khóa học: </span>
                                      <span className="text-neutral-700 text-13">{classItem.courseName}</span>
                                    </div>
                                    <div className="ps-20">
                                      <span className="text-neutral-600 text-13">Session đang học: </span>
                                      <span className="text-neutral-700 text-13 fw-medium">
                                        {classItem.currentSessionTitle}
                                        {classItem.currentSessionOrder !== null && (
                                          <span className="text-neutral-500 ms-4">(Số thứ tự: {classItem.currentSessionOrder})</span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => handleChangeClassClick(classItem)}
                                      className="d-flex align-items-center gap-2"
                                    >
                                      <i className="fas fa-exchange-alt"></i>
                                      Đổi lớp
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <h6 className="text-neutral-900 fw-bold mb-12">Lịch học/dạy:</h6>
                  
                  {loadingSchedule ? (
                    <div className="text-center py-20">
                      <Spinner animation="border" size="sm" />
                      <p className="text-neutral-600 mt-8">Đang tải lịch...</p>
                    </div>
                  ) : calendarSchedules.length === 0 ? (
                    <p className="text-neutral-500 text-center py-20">Không có lịch học/dạy</p>
                  ) : (
                    <div className="border border-neutral-100 rounded-12 p-16 bg-white mb-16">
                      <ScheduleCalendar
                        schedules={calendarSchedules}
                        onEditSchedule={() => {}} // Read-only
                        onDeleteSchedule={() => {}} // Read-only
                        onCreateMakeup={() => {}} // Read-only
                        classService={classService}
                        studentSchedule={senderSchedule.map(sch => {
                          const scheduleDate = new Date(sch.date);
                          const dateStr = formatDateToYYYYMMDD(scheduleDate);
                          return {
                            date: dateStr,
                            startTime: sch.startTime || '',
                            endTime: sch.endTime || ''
                          };
                        })}
                      />
                    </div>
                  )}
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowDetailModal(false);
                  setRejectReason('');
                  setSelectedRequest(null);
                  setSenderSchedule([]);
                }}
              >
                Đóng
              </Button>
              <Button 
                variant="success" 
                onClick={handleApprove} 
                disabled={processing}
              >
                {processing ? 'Đang xử lý...' : 'Xác nhận chấp nhận'}
              </Button>
            </Modal.Footer>
          </Modal>

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
          }} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>Đổi lớp</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedClassToChange && (
                <div className="row g-4">
                  {/* Cột trái: Lớp đang học */}
                  <div className="col-md-6">
                    <div className="border border-primary rounded-8 p-16 bg-primary-25">
                      <h6 className="text-primary fw-bold mb-16">Lớp đang học</h6>
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <small className="text-muted d-block mb-1">Tên lớp:</small>
                          <div className="fw-bold">{selectedClassToChange.className || 'N/A'}</div>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Tên khóa học:</small>
                          <div className="fw-bold">{selectedClassToChange.courseName || 'N/A'}</div>
                        </div>
                        {selectedClassToChange.roomName && (
                          <div>
                            <small className="text-muted d-block mb-1">Phòng học:</small>
                            <div className="fw-semibold">{selectedClassToChange.roomName || 'N/A'}</div>
                          </div>
                        )}
                        {selectedClassToChange.fixedSchedules && selectedClassToChange.fixedSchedules.length > 0 ? (
                          <div>
                            <small className="text-muted d-block mb-2">Lịch học:</small>
                            <div className="border rounded-8 p-12 bg-white">
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
                    <div className="border border-success rounded-8 p-16 bg-success-25">
                      <h6 className="text-success fw-bold mb-16">Lớp muốn đổi</h6>
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <small className="text-muted d-block mb-1">Tên khóa học:</small>
                          <div className="fw-bold">{selectedClassToChange.courseName || 'N/A'}</div>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Chọn lớp:</small>
                          {loadingAvailableClasses ? (
                            <div className="text-center py-12">
                              <Spinner animation="border" size="sm" />
                              <p className="text-neutral-600 mt-8 text-12">Đang tải...</p>
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
                              <div className="text-center py-12">
                                <Spinner animation="border" size="sm" />
                                <p className="text-neutral-600 mt-8 text-12">Đang tải thông tin lớp...</p>
                              </div>
                            ) : selectedNewClassInfo ? (
                              <>
                                <div>
                                  <small className="text-muted d-block mb-1">Tên lớp:</small>
                                  <div className="fw-bold">{selectedNewClassInfo.className || 'N/A'}</div>
                                </div>
                                {selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0 && (
                                  <div>
                                    <small className="text-muted d-block mb-1">Phòng học:</small>
                                    <div className="fw-semibold">
                                      {selectedNewClassInfo.fixedSchedules[0]?.roomName || 'N/A'}
                                    </div>
                                  </div>
                                )}
                                {(selectedNewClassInfo.studentCount !== null || selectedNewClassInfo.roomCapacity !== null) && (
                                  <div>
                                    <small className="text-muted d-block mb-1">Số lượng học sinh:</small>
                                    <div className="fw-semibold">
                                      {selectedNewClassInfo.studentCount !== null ? selectedNewClassInfo.studentCount : 'N/A'}
                                      {selectedNewClassInfo.roomCapacity !== null && (
                                        <span className="text-muted ms-2">/ {selectedNewClassInfo.roomCapacity}</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {selectedNewClassInfo.fixedSchedules && selectedNewClassInfo.fixedSchedules.length > 0 ? (
                                  <div>
                                    <small className="text-muted d-block mb-2">Lịch học:</small>
                                    <div className="border rounded-8 p-12 bg-white">
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
                  // TODO: Xử lý logic xác nhận đổi lớp
                  alert('Chức năng xác nhận đổi lớp sẽ được triển khai');
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

