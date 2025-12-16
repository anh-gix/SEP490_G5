import { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Table, Badge, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import academicWorkRequestService from '../../services/academicWorkRequestService';

const WorkRequestList = ({ onViewDetail }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const searchTimeoutRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch requests
  useEffect(() => {
    if (user?._id) {
      fetchRequests();
    }
  }, [user, statusFilter]);

  // Filter and sort requests
  useEffect(() => {
    filterAndSortRequests();
  }, [requests, debouncedSearchTerm, sortBy]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = { userId: user._id };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await academicWorkRequestService.getAssignedRequests(params);
      
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching work requests:', error);
      toast.error('Lỗi khi tải danh sách công việc: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRequests = () => {
    let filtered = [...requests];

    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(req => {
        const typeName = getRequestTypeName(req.requestType).toLowerCase();
        const note = (req.requestNote || '').toLowerCase();
        const sender = (req.requestedBy?.username || '').toLowerCase();
        return typeName.includes(searchLower) || note.includes(searchLower) || sender.includes(searchLower);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.requestedAt) - new Date(a.requestedAt);
        case 'oldest':
          return new Date(a.requestedAt) - new Date(b.requestedAt);
        case 'sender':
          const nameA = a.requestedBy?.username || '';
          const nameB = b.requestedBy?.username || '';
          return nameA.localeCompare(nameB);
        case 'sender-desc':
          const nameA2 = a.requestedBy?.username || '';
          const nameB2 = b.requestedBy?.username || '';
          return nameB2.localeCompare(nameA2);
        default:
          return 0;
      }
    });

    setFilteredRequests(filtered);
  };

  const getRequestTypeName = (type) => {
    const names = {
      assign_students: 'Sắp xếp học viên',
      create_program: 'Tạo chương trình',
      edit_course: 'Chỉnh sửa khóa học',
      create_exam: 'Tạo đề thi'
    };
    return names[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'warning', text: 'Chờ xử lý' },
      in_progress: { bg: 'info', text: 'Đang xử lý' },
      completed: { bg: 'success', text: 'Hoàn thành' },
      rejected: { bg: 'danger', text: 'Từ chối' },
      cancelled: { bg: 'secondary', text: 'Đã hủy' }
    };
    const badge = badges[status] || { bg: 'secondary', text: status };
    return <Badge bg={badge.bg}>{badge.text}</Badge>;
  };

  return (
    <div>
      {/* Filters Card */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-20">
          <Row className="g-3 align-items-center">
            {/* Search */}
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-neutral-50 border-neutral-200">
                  <i className="fas fa-search text-neutral-600"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm theo loại, ghi chú, người gửi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-neutral-200"
                />
              </InputGroup>
            </Col>

            {/* Status Filter */}
            <Col md={3}>
              <Form.Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-neutral-200"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
              </Form.Select>
            </Col>

            {/* Sort */}
            <Col md={3}>
              <Form.Select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-neutral-200"
              >
                <option value="newest">Mới nhất trước</option>
                <option value="oldest">Cũ nhất trước</option>
                <option value="sender">Theo người gửi (A-Z)</option>
                <option value="sender-desc">Theo người gửi (Z-A)</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="text-center py-40">
          <Spinner animation="border" variant="primary" />
          <p className="text-neutral-600 mt-16">Đang tải danh sách công việc...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-0">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-40">
                <i className="fas fa-inbox text-neutral-400" style={{ fontSize: '48px' }}></i>
                <p className="text-neutral-600 mt-16 mb-0">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Không tìm thấy công việc phù hợp' 
                    : 'Chưa có công việc nào được giao'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table className="mb-0" hover>
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-neutral-700 fw-semibold px-20 py-12 border-0">Loại yêu cầu</th>
                      <th className="text-neutral-700 fw-semibold px-20 py-12 border-0">Ghi chú</th>
                      <th className="text-neutral-700 fw-semibold px-20 py-12 border-0">Trạng thái</th>
                      <th className="text-neutral-700 fw-semibold px-20 py-12 border-0">Ngày gửi</th>
                      <th className="text-neutral-700 fw-semibold px-20 py-12 border-0 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr key={req._id} style={{ cursor: 'pointer' }} onClick={() => onViewDetail(req._id)}>
                        <td className="px-20 py-16 align-middle">
                          <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                            {getRequestTypeName(req.requestType)}
                          </span>
                        </td>
                        <td className="px-20 py-16 align-middle text-neutral-700">
                          {req.requestNote || <span className="text-neutral-400">N/A</span>}
                        </td>
                        <td className="px-20 py-16 align-middle">
                          {getStatusBadge(req.status)}
                        </td>
                        <td className="px-20 py-16 align-middle text-neutral-700">
                          {new Date(req.requestedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-20 py-16 align-middle text-center">
                          <Button 
                            variant="primary"
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetail(req._id);
                            }}
                            className="d-inline-flex align-items-center gap-2"
                          >
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default WorkRequestList;
