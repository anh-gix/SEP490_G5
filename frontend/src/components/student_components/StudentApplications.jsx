import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Pagination, Button, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import changeRequestService from '../../services/changeRequestService';
import CreateChangeRequestModal from './CreateChangeRequestModal';

/**
 * Student Applications Component
 * Quản lý đơn đã gửi của học viên
 */
const StudentApplications = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [changeRequests, setChangeRequests] = useState([]);
  const [allChangeRequests, setAllChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const itemsPerPage = 10;

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = [...allChangeRequests];

    // Filter by current user (sender)
    if (user?._id) {
      filtered = filtered.filter(request => {
        const senderId = request.sender?._id || request.sender;
        return senderId?.toString() === user._id.toString();
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(request => {
        const content = (request.content || '').toLowerCase();
        return content.includes(searchLower);
      });
    }

    // Filter by status
    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    // Filter by type
    if (filterType && filterType !== 'all') {
      filtered = filtered.filter(request => request.type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });

    return filtered;
  }, [allChangeRequests, user, searchTerm, filterStatus, filterType, sortBy]);

  // Paginate requests
  const paginatedRequests = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedRequests.slice(startIndex, endIndex);
  }, [filteredAndSortedRequests, page]);

  // Update pagination when filtered results change
  useEffect(() => {
    const total = filteredAndSortedRequests.length;
    setTotal(total);
    setTotalPages(Math.ceil(total / itemsPerPage));
    if (page > Math.ceil(total / itemsPerPage) && total > 0) {
      setPage(1);
    }
  }, [filteredAndSortedRequests, page]);

  // Update displayed requests
  useEffect(() => {
    setChangeRequests(paginatedRequests);
  }, [paginatedRequests]);

  // Fetch change requests
  useEffect(() => {
    fetchChangeRequests();
  }, []);

  // Check for success toast state from navigation
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success('Gửi đơn xin nghỉ thành công!');
      // Clear the state to prevent showing toast again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 10000 }; // Fetch all for client-side filtering
      
      const response = await changeRequestService.getAllChangeRequests(params);
      if (response.success) {
        const requests = response.changeRequests || [];
        setAllChangeRequests(requests);
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
      request_replace_teacher: { variant: 'secondary', text: 'Thay giáo viên' }
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

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCreateSuccess = () => {
    toast.success('Gửi đơn thành công!');
    fetchChangeRequests();
  };

  return (
    <Container fluid className="p-24">
      {/* Header */}
      <div className="mb-24">
        <h4 className="text-neutral-900 fw-bold mb-8">Quản lý đơn đã gửi</h4>
        <p className="text-neutral-600 mb-0">Xem và theo dõi các đơn xin đổi buổi/lớp học mà bạn đã gửi</p>
      </div>

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
                  placeholder="Tìm theo nội dung đơn..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
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
                  setPage(1);
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
                <option value="newest">Mới nhất trước</option>
                <option value="oldest">Cũ nhất trước</option>
              </Form.Select>
            </Col>

            <Col md={2} className="d-flex justify-content-end">
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="w-100"
              >
                <i className="fas fa-plus me-2"></i>
                Tạo đơn
              </Button>
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
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Loại đơn</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Nội dung</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Ngày gửi</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Trạng thái</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Người duyệt</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Ngày duyệt</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Hành động</th>
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
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          Xem chi tiết
                        </Button>
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
      <Modal 
        show={showDetailModal} 
        onHide={() => {
          setShowDetailModal(false);
          setSelectedRequest(null);
        }} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Loại đơn:</strong>
                </Col>
                <Col md={8}>
                  {getTypeBadge(selectedRequest.type)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Nội dung:</strong>
                </Col>
                <Col md={8}>
                  {selectedRequest.content}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Ngày gửi:</strong>
                </Col>
                <Col md={8}>
                  {formatDate(selectedRequest.createdAt)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Trạng thái:</strong>
                </Col>
                <Col md={8}>
                  {getStatusBadge(selectedRequest.status)}
                </Col>
              </Row>
              {selectedRequest.approver && (
                <Row className="mb-3">
                  <Col md={4}>
                    <strong>Người duyệt:</strong>
                  </Col>
                  <Col md={8}>
                    {selectedRequest.approver.username} ({selectedRequest.approver.email})
                  </Col>
                </Row>
              )}
              {selectedRequest.approvedDate && (
                <Row className="mb-3">
                  <Col md={4}>
                    <strong>Ngày duyệt:</strong>
                  </Col>
                  <Col md={8}>
                    {formatDate(selectedRequest.approvedDate)}
                  </Col>
                </Row>
              )}
              {selectedRequest.responseContent && (
                <Row className="mb-3">
                  <Col md={4}>
                    <strong>Phản hồi:</strong>
                  </Col>
                  <Col md={8}>
                    {selectedRequest.responseContent}
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowDetailModal(false);
              setSelectedRequest(null);
            }}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Change Request Modal */}
      <CreateChangeRequestModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
};

export default StudentApplications;

