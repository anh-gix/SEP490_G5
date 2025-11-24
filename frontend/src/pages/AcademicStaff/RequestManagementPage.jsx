import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Pagination, Button, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import ScheduleCalendar from '../../components/class_management/ScheduleCalendar';
import changeRequestService from '../../services/changeRequestService';
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
  const [showRejectForm, setShowRejectForm] = useState(false);

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
        roomName: schedule.room?.room_name || 'N/A',
        topic: schedule.session?.title || schedule.topic || '',
        status: schedule.status === 'fixed' ? 'scheduled' : schedule.status === 'temporary' ? 'makeup' : 'scheduled',
        teacherName: schedule.class?.teacher?.username || 'N/A',
        lessonNumber: schedule.session?.order || '',
        lessonTopic: schedule.session?.title || '',
        attendanceStatus: attendanceStatus, // 'present', 'absent', 'late', 'excused', or null
        hasAttendance: !!attendanceStatus
      };
    });
  }, [senderSchedule]);

  const handleRowClick = async (request) => {
    if (request.status !== 'pending') return; // Chỉ mở modal cho đơn pending
    
    setSelectedRequest(request);
    setShowDetailModal(true);
    setShowRejectForm(false);
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

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      await changeRequestService.approveChangeRequest(selectedRequest._id);
      setShowDetailModal(false);
      setSelectedRequest(null);
      setShowRejectForm(false);
      setRejectReason('');
      fetchChangeRequests(); // Refresh list
    } catch (err) {
      console.error('Error approving request:', err);
      alert(err.message || 'Có lỗi xảy ra khi chấp nhận đơn');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      await changeRequestService.rejectChangeRequest(selectedRequest._id, rejectReason || null);
      setShowDetailModal(false);
      setSelectedRequest(null);
      setShowRejectForm(false);
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
                    </tr>
                  </thead>
                  <tbody>
                    {changeRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-40 text-neutral-500">
                          Không có đơn nào
                        </td>
                      </tr>
                    ) : (
                      changeRequests.map((request) => (
                        <tr 
                          key={request._id}
                          onClick={() => handleRowClick(request)}
                          style={{ 
                            cursor: request.status === 'pending' ? 'pointer' : 'default' 
                          }}
                          className={request.status === 'pending' ? 'table-row-hover' : ''}
                        >
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

          {/* Detail Modal */}
          <Modal show={showDetailModal} onHide={() => {
            setShowDetailModal(false);
            setShowRejectForm(false);
            setRejectReason('');
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
                  />
                </div>
              )}

              {/* Reject Form */}
              {showRejectForm && (
                <div className="mt-16 pt-16 border-top">
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
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowDetailModal(false);
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
              >
                Đóng
              </Button>
              {selectedRequest?.status === 'pending' && (
                <>
                  {!showRejectForm ? (
                    <>
                      <Button 
                        variant="success" 
                        onClick={handleApprove} 
                        disabled={processing}
                      >
                        {processing ? 'Đang xử lý...' : 'Chấp nhận'}
                      </Button>
                      <Button 
                        variant="danger" 
                        onClick={() => setShowRejectForm(true)}
                        disabled={processing}
                      >
                        Từ chối
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setShowRejectForm(false);
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
                    </>
                  )}
                </>
              )}
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
};

export default RequestManagementPage;

