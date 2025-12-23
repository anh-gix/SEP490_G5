import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from '../compo/Card';
import Button from '../compo/Button';
import { workRequestService } from '../../../services/workRequestService';
import { formatDate } from '../../../helper/helper';
import CreateWorkRequestModal from '../compo/CreateWorkRequestModal';
import userService from '../../../services/userService';

const ApprovalRequests = () => {
  const navigate = useNavigate();
  const [activeTab] = useState('top_down'); // Only 'top_down' - Công việc đã giao
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Modal transition state
  const [pendingModal, setPendingModal] = useState(null); // 'approve', 'reject', 'cancel', 'revoke', null
  const [createRequestType, setCreateRequestType] = useState('create_program'); // 'create_program' | 'create_exam'
  const [approveNote, setApproveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [deleteLinkedEntity, setDeleteLinkedEntity] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Assignee list (Subject Leaders for program/exam, Academic Staff for assign_students)
  const [assigneeList, setAssigneeList] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    // Bottom-up stats
    pendingApprovals: 0,
    approved: 0,
    rejected: 0,
    // Top-down stats
    pendingTasks: 0,
    inProgressTasks: 0,
    pendingApprovalTasks: 0,
    completedTasks: 0
  });

  useEffect(() => {
    fetchRequests();
  }, [activeTab, statusFilter, currentPage, itemsPerPage]);

  // Calculate stats from current requests list
  const calculateStatsFromRequests = (requestsList) => {
    const statsCount = {
      pending: 0,
      in_progress: 0,
      pending_approval: 0,
      completed: 0
    };

    requestsList.forEach(request => {
      if (statsCount[request.status] !== undefined) {
        statsCount[request.status]++;
      }
    });

    setStats({
      pendingApprovals: 0, // Not used for center head view
      approved: 0, // Not used for center head view
      rejected: 0, // Not used for center head view
      pendingTasks: statsCount.pending,
      inProgressTasks: statsCount.in_progress,
      pendingApprovalTasks: statsCount.pending_approval,
      completedTasks: statsCount.completed
    });
  };

  // Handle modal transitions
  useEffect(() => {
    if (pendingModal) {
      // Close detail modal first
      setShowDetailModal(false);

      // Use a timeout to ensure the detail modal is fully closed before opening the new modal
      const timer = setTimeout(() => {
        switch (pendingModal) {
          case 'approve':
            setShowApproveModal(true);
            break;
          case 'reject':
            setShowRejectModal(true);
            break;
          case 'cancel':
            setShowCancelModal(true);
            break;
          case 'revoke':
            setShowRevokeModal(true);
            break;
          default:
            break;
        }
        setPendingModal(null);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [pendingModal]);

  // Fetch assignees based on request type
  const fetchAssignees = async (requestType) => {
    try {
      let rolesToQuery = [];

      if (requestType === 'create_program' || requestType === 'create_exam') {
        rolesToQuery = ['Subject Leader'];
      } else if (requestType === 'assign_students') {
        rolesToQuery = ['Academic Staff'];
      }

      const response = await userService.getUsersByRoles(rolesToQuery);
      if (response.success && response.data && response.data.length > 0) {
        setAssigneeList(response.data);
      } else {
        toast.warning(`Không tìm thấy ${requestType === 'assign_students' ? 'Academic Staff' : 'Subject Leader'} nào trong hệ thống!`, {
          position: 'top-right'
        });
        setAssigneeList([]);
      }
    } catch (error) {
      console.error('Error fetching assignees:', error);
      console.error('Error details:', error.response || error);
      toast.error('Không thể tải danh sách người phụ trách!', { position: 'top-right' });
      setAssigneeList([]);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const params = {
        direction: activeTab,
        page: currentPage,
        limit: itemsPerPage
      };

      // Add filters only if they have values
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await workRequestService.getAllRequests(params);

      if (response.success) {
        setRequests(response.data);
        if (response.pagination) {
          setTotalItems(response.pagination.total);
          setTotalPages(response.pagination.totalPages);
        }

        // Calculate stats from all requests (fetch without pagination for accurate stats)
        const allRequestsParams = {
          direction: activeTab,
          limit: 1000 // Large limit to get all records for stats calculation
        };
        if (statusFilter && statusFilter !== 'all') {
          allRequestsParams.status = statusFilter;
        }

        try {
          const allRequestsResponse = await workRequestService.getAllRequests(allRequestsParams);
          if (allRequestsResponse.success) {
            calculateStatsFromRequests(allRequestsResponse.data);
          }
        } catch (statsError) {
          console.error('Error fetching stats:', statsError);
          // Fallback to current page stats if all requests fetch fails
          calculateStatsFromRequests(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      const response = await workRequestService.approveRequest(selectedRequest._id, {
        responseNote: approveNote.trim() || undefined
      });

      if (response.success) {
        alert('Đã duyệt yêu cầu thành công!');
        setShowApproveModal(false);
        setShowDetailModal(false);
        setApproveNote('');
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert(error.message || 'Có lỗi xảy ra khi duyệt yêu cầu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setActionLoading(true);
      const response = await workRequestService.rejectRequest(selectedRequest._id, {
        rejectionReason: rejectReason.trim(),
        responseNote: reviewNote.trim() || undefined
      });

      if (response.success) {
        alert('Đã từ chối yêu cầu');
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectReason('');
        setReviewNote('');
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error.message || 'Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedRequest || !revokeReason.trim()) {
      alert('Vui lòng nhập lý do thu hồi phê duyệt');
      return;
    }

    try {
      setActionLoading(true);
      const response = await workRequestService.revokeApproval(selectedRequest._id, {
        reason: revokeReason.trim()
      });

      if (response.success) {
        alert('Đã thu hồi phê duyệt thành công! Yêu cầu đã chuyển về trạng thái chờ duyệt.');
        setShowRevokeModal(false);
        setShowDetailModal(false);
        setRevokeReason('');
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error revoking approval:', error);
      alert(error.message || 'Có lỗi xảy ra khi thu hồi phê duyệt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      const response = await workRequestService.cancelRequest(selectedRequest._id, {
        deleteLinkedEntity: deleteLinkedEntity
      });

      if (response.success) {
        const deletedMsg = response.deletedEntity
          ? ' Program liên quan đã được xóa.'
          : ' Program liên quan được giữ lại.';

        toast.success(`Đã hủy yêu cầu thành công!${deletedMsg}`, {
          position: 'top-right'
        });

        setShowCancelModal(false);
        setShowDetailModal(false);
        setDeleteLinkedEntity(false);
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error canceling request:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi hủy yêu cầu!', {
        position: 'top-right'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateWorkRequest = async (requestData) => {
    try {
      // Check if a similar work request already exists
      const existingRequests = await workRequestService.getAllRequests({
        direction: 'top_down',
        requestType: createRequestType,
        status: 'pending,in_progress,pending_approval'
      });

      // Check if there's already a pending/in-progress request for the same assignee and type
      if (existingRequests.data && existingRequests.data.length > 0) {
        const duplicate = existingRequests.data.find(req =>
          req.assignedTo?._id === requestData.assignedTo &&
          req.requestType === createRequestType &&
          ['pending', 'in_progress', 'pending_approval'].includes(req.status)
        );

        if (duplicate) {
          const result = await Swal.fire({
            title: 'Yêu cầu đã tồn tại',
            text: `Đã có yêu cầu ${createRequestType === 'create_program' ? 'tạo chương trình' : 'tạo đề thi'} cho Subject Leader này đang trong trạng thái "${getStatusBadge(duplicate.status).props.children}". Bạn có muốn tạo yêu cầu mới không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Tạo mới',
            cancelButtonText: 'Hủy'
          });

          if (!result.isConfirmed) {
            return;
          }
        }
      }

      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append('requestType', createRequestType);
      formData.append('assignedTo', requestData.assignedTo);
      formData.append('requestNote', requestData.requestNote);

      if (requestData.attachmentType === 'link' && requestData.attachmentUrl) {
        formData.append('attachmentUrl', requestData.attachmentUrl);
      } else if (requestData.attachmentType === 'file' && requestData.attachmentFile) {
        formData.append('attachmentFile', requestData.attachmentFile);
      }

      // Create work request
      const response = await workRequestService.createRequest(formData);

      if (response.success) {
        toast.success(`Đã tạo yêu cầu ${createRequestType === 'create_program' ? 'tạo chương trình' : 'tạo đề thi'} thành công!`, {
          position: 'top-right'
        });
        setShowCreateModal(false);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error creating work request:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo yêu cầu!', { position: 'top-right' });
      throw error;
    }
  };

  const handleViewEntityDetail = () => {
    if (!selectedRequest) return;

    const { entityType, entityId } = selectedRequest;

    if (entityType === 'Program' && entityId?._id) {
      navigate(`/center-head/programs/${entityId._id}`);
    } else if (entityType === 'Exam' && entityId?._id) {
      // Navigate to exam detail if route exists
      navigate(`/center-head/exams/${entityId._id}`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(parseInt(newLimit));
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-warning-subtle text-warning', text: 'Chờ xử lý' },
      in_progress: { class: 'bg-info-subtle text-info', text: 'Đang làm' },
      pending_approval: { class: 'bg-primary-subtle text-primary', text: 'Chờ duyệt' },
      approved: { class: 'bg-success-subtle text-success', text: 'Đã duyệt' },
      rejected: { class: 'bg-danger-subtle text-danger', text: 'Từ chối' },
      completed: { class: 'bg-success-subtle text-success', text: 'Hoàn thành' },
      need_revision: { class: 'bg-secondary-subtle text-secondary', text: 'Cần sửa' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`badge ${badge.class} px-3 py-2 rounded-pill`}>
        {badge.text}
      </span>
    );
  };

  const getRequestTypeName = (type) => {
    const names = {
      program: 'Chương trình',
      exam: 'Đề thi',
      create_program: 'Tạo chương trình',
      edit_program: 'Chỉnh sửa chương trình',
      edit_course: 'Chỉnh sửa khóa học',
      create_exam: 'Tạo đề thi',
      assign_students: 'Sắp xếp học viên'
    };
    return names[type] || type;
  };

  // Filter requests by search query (client-side)
  const filteredRequests = requests.filter(req => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const entityName = req.entityId?.program_name || req.entityId?.name || req.entityId?.title || '';
    const requesterName = req.requestedBy?.username || req.requestedBy?.name || '';
    const requesterEmail = req.requestedBy?.email || '';
    const assigneeName = req.assignedTo?.username || req.assignedTo?.name || '';

    return (
      entityName.toLowerCase().includes(query) ||
      requesterName.toLowerCase().includes(query) ||
      requesterEmail.toLowerCase().includes(query) ||
      assigneeName.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approval-requests-container">
      {/* Header Section */}
      <div className="mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-2">Công việc đã giao</h2>
          <p className="text-muted mb-0">Theo dõi tiến độ công việc đã giao</p>
        </div>
        <div className="dropdown">
          <button
            className="btn btn-primary dropdown-toggle"
            type="button"
            id="createRequestDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="ph ph-plus me-2"></i>
            Tạo yêu cầu mới
          </button>
          <ul className="dropdown-menu" aria-labelledby="createRequestDropdown">
            <li>
              <button
                className="dropdown-item"
                onClick={async () => {
                  setCreateRequestType('create_program');
                  await fetchAssignees('create_program');
                  setShowCreateModal(true);
                }}
              >
                <i className="ph ph-book me-2"></i>
                Tạo chương trình mới
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={async () => {
                  setCreateRequestType('create_exam');
                  await fetchAssignees('create_exam');
                  setShowCreateModal(true);
                }}
              >
                <i className="ph ph-file-text me-2"></i>
                Tạo đề thi mới
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                className="dropdown-item"
                onClick={async () => {
                  setCreateRequestType('assign_students');
                  await fetchAssignees('assign_students');
                  setShowCreateModal(true);
                }}
              >
                <i className="ph ph-users me-2"></i>
                Cấp tài khoản
              </button>
            </li>
          </ul>
        </div>
      </div>


      {/* Stats Cards Section */}
      <div className="row g-4 mb-5">
          <div className="col-md-3">
            <Card variant="shadow">
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small mb-1">Chưa nhận</div>
                    <div className="h3 fw-bold text-warning mb-0">{stats.pendingTasks}</div>
                  </div>
                  <div className="text-warning" style={{ fontSize: '2.5rem', opacity: 0.2 }}>
                    <i className="ph ph-hourglass"></i>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-md-3">
            <Card variant="shadow">
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small mb-1">Đang làm</div>
                    <div className="h3 fw-bold text-info mb-0">{stats.inProgressTasks}</div>
                  </div>
                  <div className="text-info" style={{ fontSize: '2.5rem', opacity: 0.2 }}>
                    <i className="ph ph-spinner"></i>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-md-3">
            <Card variant="shadow">
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small mb-1">Chờ duyệt</div>
                    <div className="h3 fw-bold text-primary mb-0">{stats.pendingApprovalTasks}</div>
                  </div>
                  <div className="text-primary" style={{ fontSize: '2.5rem', opacity: 0.2 }}>
                    <i className="ph ph-eye"></i>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-md-3">
            <Card variant="shadow">
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small mb-1">Hoàn thành</div>
                    <div className="h3 fw-bold text-success mb-0">{stats.completedTasks}</div>
                  </div>
                  <div className="text-success" style={{ fontSize: '2.5rem', opacity: 0.2 }}>
                    <i className="ph ph-check-circle"></i>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

      {/* Filters Section */}
      <Card variant="shadow" className="mb-4">
        <div className="p-3">
          {/* Basic Filters */}
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-6">
              <label className="form-label fw-medium">Tìm kiếm</label>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo tên, người được giao..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="col-md-6">
              <label className="form-label fw-medium">Trạng thái</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chưa nhận</option>
                <option value="in_progress">Đang làm</option>
                <option value="pending_approval">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Requests Table Section */}
      <Card variant="shadow" className="mb-4">
        <div className="p-3 border-bottom bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{totalItems}</strong> yêu cầu
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="mb-0 small text-muted">Hiển thị:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="small text-muted">/ trang</span>
            </div>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-5">
            <i className="ph ph-clipboard text-muted" style={{ fontSize: '48px' }}></i>
            <p className="text-muted mt-3 mb-0">Không tìm thấy yêu cầu nào</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold">Loại</th>
                  <th className="fw-semibold">Tên</th>
                  <th className="fw-semibold">Người được giao</th>
                  <th className="fw-semibold">Trạng thái</th>
                  <th className="fw-semibold">Ngày tạo</th>
                  <th className="fw-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleViewDetail(request)}
                  >
                    <td>
                      <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                        {getRequestTypeName(request.requestType)}
                      </span>
                    </td>
                    <td>
                      <div className="fw-medium">
                        {request.entityId?.program_name || request.entityId?.name || request.entityId?.title || 'N/A'}
                      </div>
                      <small className="text-muted">{request.entityType || 'N/A'}</small>
                    </td>
                    <td>
                      <div className="fw-medium">{request.assignedTo?.username || request.assignedTo?.name || 'Chưa giao'}</div>
                      <small className="text-muted">{request.assignedTo?.email || ''}</small>
                    </td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td className="text-muted">{formatDate(request.requestedAt)}</td>
                    <td>
                      <i className="ph ph-caret-right text-muted"></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <Card variant="shadow">
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Trang {currentPage} / {totalPages}
                <span className="ms-2">
                  (Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems})
                </span>
              </div>
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <i className="ph ph-caret-double-left"></i>
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="ph ph-caret-left"></i>
                    </button>
                  </li>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="ph ph-caret-right"></i>
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="ph ph-caret-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header border-bottom bg-light">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '48px', height: '48px' }}>
                    <i className="ph ph-clipboard-text text-primary fs-4"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-1">Chi tiết yêu cầu công việc</h5>
                    <p className="text-muted small mb-0">
                      {selectedRequest.entityId?.program_name || selectedRequest.entityId?.name || selectedRequest.entityId?.title || 'Chưa có thông tin'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRequest(null);
                  }}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <div className="row g-4">
                  {/* Request Type Card */}
                  <div className="col-12">
                    <div className="card bg-light border-0">
                      <div className="card-body py-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <i className="ph ph-clipboard-text text-primary fs-4"></i>
                            <div>
                              <small className="text-muted d-block">Loại yêu cầu</small>
                              <span className="fw-semibold">{getRequestTypeName(selectedRequest.requestType)}</span>
                            </div>
                          </div>
                          <span className={`badge ${selectedRequest.direction === 'bottom_up' ? 'bg-info' : 'bg-purple'} text-white px-3 py-2`}>
                            <i className={`ph ${selectedRequest.direction === 'bottom_up' ? 'ph-arrow-circle-up' : 'ph-arrow-circle-down'} me-2`}></i>
                            {selectedRequest.direction === 'bottom_up' ? 'Yêu cầu phê duyệt' : 'Công việc được giao'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status and Date */}
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-2">Trạng thái</label>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-2">Ngày giao việc</label>
                    <div className="d-flex align-items-center gap-2">
                      <i className="ph ph-calendar text-muted"></i>
                      <span>{formatDate(selectedRequest.requestedAt)}</span>
                    </div>
                  </div>

                  {/* Người giao việc */}
                  <div className="col-12">
                    <label className="form-label text-muted small mb-2">Người giao việc (Center Head)</label>
                    <div className="card border">
                      <div className="card-body py-2">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                               style={{ width: '40px', height: '40px' }}>
                            <i className="ph ph-user text-primary fs-5"></i>
                          </div>
                          <div>
                            <div className="fw-semibold">
                              {selectedRequest.requestedBy?.username || selectedRequest.requestedBy?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-muted">
                              {selectedRequest.requestedBy?.email || ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Người được giao */}
                  {selectedRequest.direction === 'top_down' && selectedRequest.assignedTo && (
                    <div className="col-12">
                      <label className="form-label text-muted small mb-2">Người được giao (Subject Leader)</label>
                      <div className="card border border-success">
                        <div className="card-body py-2">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                 style={{ width: '40px', height: '40px' }}>
                              <i className="ph ph-user-check text-success fs-5"></i>
                            </div>
                            <div>
                              <div className="fw-semibold">
                                {selectedRequest.assignedTo?.username || selectedRequest.assignedTo?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-muted">
                                {selectedRequest.assignedTo?.email || ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Entity Info */}
                  {selectedRequest.entityId && (
                    <div className="col-12">
                      <label className="form-label text-muted small mb-2">
                        <i className="ph ph-info me-1"></i>
                        Thông tin {selectedRequest.entityType}
                      </label>
                      <div className="card border border-info">
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-8">
                              <small className="text-muted d-block">Tên</small>
                              <span className="fw-semibold">{selectedRequest.entityId?.program_name || selectedRequest.entityId?.name || selectedRequest.entityId?.title}</span>
                            </div>
                            <div className="col-md-4">
                              <small className="text-muted d-block">Mã</small>
                              <span className="fw-medium">{selectedRequest.entityId?.code || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={handleViewEntityDetail}
                            >
                              <i className="ph ph-arrow-square-out me-2"></i>
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ghi chú yêu cầu */}
                  <div className="col-12">
                    <label className="form-label text-muted small mb-2">
                      <i className="ph ph-note me-1"></i>
                      Ghi chú yêu cầu
                    </label>
                    <div className="card border bg-light">
                      <div className="card-body">
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                          {selectedRequest.requestNote || 'Không có ghi chú'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Response Info (if processed) */}
                  {selectedRequest.processedBy && (
                    <div className="col-12">
                      <label className="form-label text-muted small mb-2">
                        <i className="ph ph-check-square me-1"></i>
                        Thông tin xử lý
                      </label>
                      <div className="card border">
                        <div className="card-body">
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <small className="text-muted d-block">Người xử lý</small>
                              <span className="fw-semibold">{selectedRequest.processedBy?.username || selectedRequest.processedBy?.name}</span>
                              <small className="text-muted d-block">{selectedRequest.processedBy?.email}</small>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted d-block">Ngày xử lý</small>
                              <span>{formatDate(selectedRequest.processedAt)}</span>
                            </div>
                          </div>
                          {selectedRequest.responseNote && (
                            <div className="p-3  bg-opacity-10">
                              <small className="text ">Phản hồi</small>
                              <p className="mb-0">{selectedRequest.responseNote}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {selectedRequest.rejectionReason && (
                    <div className="col-12">
                      <label className="form-label text-danger small mb-2">
                        <i className="ph ph-warning-circle me-1"></i>
                        Lý do từ chối
                      </label>
                      <div className="card border border-danger bg-danger bg-opacity-10">
                        <div className="card-body">
                          <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                            {selectedRequest.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Revocation Info (if revoked) */}
                  {selectedRequest.revocation?.revokedBy && (
                    <div className="col-12">
                      <label className="form-label text-warning small mb-2">
                        <i className="ph ph-arrow-counter-clockwise me-1"></i>
                        Thông tin thu hồi phê duyệt
                      </label>
                      <div className="card border border-warning bg-warning bg-opacity-10">
                        <div className="card-body">
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <small className="text-muted d-block">Người thu hồi</small>
                              <span className="fw-semibold">{selectedRequest.revocation.revokedBy?.username || selectedRequest.revocation.revokedBy?.name || 'N/A'}</span>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted d-block">Ngày thu hồi</small>
                              <span>{formatDate(selectedRequest.revocation.revokedAt)}</span>
                            </div>
                          </div>
                          {selectedRequest.revocation.revocationReason && (
                            <div className="p-3 bg-white rounded border border-warning">
                              <small className="text-warning fw-semibold d-block mb-1">Lý do thu hồi</small>
                              <p className="mb-0">{selectedRequest.revocation.revocationReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* History */}
                  {selectedRequest.history && selectedRequest.history.length > 0 && (
                    <div className="col-12">
                      <label className="form-label text-muted small mb-2">
                        <i className="ph ph-clock-counter-clockwise me-1"></i>
                        Lịch sử
                      </label>
                      <div className="card border">
                        <div className="card-body">
                          <div className="timeline">
                            {selectedRequest.history.slice().reverse().map((entry, idx) => {
                              // Map action to icon
                              const actionIcons = {
                                created: 'plus-circle',
                                assigned: 'user-plus',
                                in_progress: 'play',
                                pending_approval: 'hourglass',
                                completed: 'check-circle',
                                completed_and_submitted: 'paper-plane-tilt',
                                approved: 'check-circle',
                                rejected: 'x-circle',
                                need_revision: 'arrow-counter-clockwise',
                                revoked: 'arrow-u-up-left',
                                submitted: 'paper-plane-tilt',
                                withdrawn: 'arrow-bend-up-left',
                                entity_recreated: 'plus-circle'
                              };

                              // Map action to label
                              const actionLabels = {
                                created: 'Tạo yêu cầu',
                                assigned: 'Được giao việc',
                                in_progress: 'Bắt đầu xử lý',
                                pending_approval: 'Chờ phê duyệt',
                                completed: 'Hoàn thành',
                                completed_and_submitted: 'Hoàn thành và nộp duyệt',
                                approved: 'Đã phê duyệt',
                                rejected: 'Bị từ chối',
                                need_revision: 'Yêu cầu chỉnh sửa',
                                revoked: 'Thu hồi phê duyệt',
                                submitted: 'Đã nộp',
                                withdrawn: 'Rút lại yêu cầu',
                                entity_recreated: 'Đã tạo lại chương trình'
                              };

                              // Map action to color
                              const actionColors = {
                                created: 'primary',
                                assigned: 'primary',
                                in_progress: 'info',
                                pending_approval: 'info',
                                completed: 'success',
                                completed_and_submitted: 'success',
                                approved: 'success',
                                rejected: 'danger',
                                need_revision: 'warning',
                                revoked: 'secondary',
                                submitted: 'info',
                                withdrawn: 'secondary',
                                entity_recreated: 'success'
                              };

                              const actionText = actionLabels[entry.action] || entry.action;
                              const actionIcon = actionIcons[entry.action] || 'clock';
                              const actionColor = actionColors[entry.action] || 'secondary';

                              return (
                                <div key={idx} className="timeline-item d-flex gap-3 mb-3">
                                  <div className="timeline-marker">
                                    <div
                                      className={`bg-${actionColor} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                                      style={{ width: '32px', height: '32px', minWidth: '32px' }}
                                    >
                                      <i className={`ph ph-${actionIcon} text-${actionColor}`}></i>
                                    </div>
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="fw-medium text-neutral-900">
                                      {actionText}
                                    </div>
                                    <div className="text-sm text-muted">
                                      {formatDate(entry.performedAt)}
                                    </div>
                                    {entry.note && (
                                      <p className="mt-1 mb-0 text-muted fst-italic small">{entry.note}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer - Actions */}
              {/* Actions for pending_approval requests */}
              {selectedRequest.status === 'pending_approval' && (
                <div className="modal-footer border-top">
                  <Button
                    variant="success"
                    onClick={() => {
                      setPendingModal('approve');
                    }}
                  >
                    <i className="ph ph-check me-2"></i>
                    Duyệt
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setPendingModal('reject');
                    }}
                  >
                    <i className="ph ph-x me-2"></i>
                    Từ chối
                  </Button>
                </div>
              )}

              {/* Actions for pending/in_progress requests - Cancel option */}
              {['pending', 'in_progress'].includes(selectedRequest.status) && (
                <div className="modal-footer border-top bg-light">
                  <div className="w-100">
                    <div className="alert alert-warning mb-3">
                      <i className="ph ph-info me-2"></i>
                      Bạn có thể hủy yêu cầu này nếu không còn cần thiết.
                    </div>
                    <div className="d-flex justify-content-end">
                      <Button
                        variant="danger"
                        onClick={() => {
                          setPendingModal('cancel');
                        }}
                      >
                        <i className="ph ph-x-circle me-2"></i>
                        Hủy yêu cầu
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal - Enhanced with detailed confirmation */}
      {showApproveModal && selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success-subtle">
                <div>
                  <h5 className="modal-title fw-bold text-success">
                    <i className="ph ph-check-circle me-2"></i>
                    Xác nhận duyệt yêu cầu
                  </h5>
                  <p className="text-muted small mb-0 mt-1">
                    Vui lòng kiểm tra kỹ thông tin trước khi phê duyệt
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowApproveModal(false);
                    setShowDetailModal(true);
                    setApproveNote('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                {/* Request Summary */}
                <div className="alert alert-info border-info mb-4">
                  <div className="d-flex align-items-start">
                    <i className="ph ph-info fs-4 me-3 mt-1"></i>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-2">Thông tin yêu cầu</h6>
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block">Loại:</small>
                          <strong>{getRequestTypeName(selectedRequest.requestType)}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Tên:</small>
                          <strong>{selectedRequest.entityId?.program_name || selectedRequest.entityId?.name || selectedRequest.entityId?.title || 'N/A'}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Người nộp:</small>
                          <strong>{selectedRequest.requestedBy?.username || selectedRequest.requestedBy?.name}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Ngày nộp:</small>
                          <strong>{formatDate(selectedRequest.requestedAt)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning message */}
                <div className="alert alert-warning border-warning mb-4">
                  <div className="d-flex align-items-start">
                    <i className="ph ph-warning fs-4 me-3 mt-1"></i>
                    <div>
                      <h6 className="fw-bold mb-2">Lưu ý quan trọng</h6>
                      <ul className="mb-0 ps-3">
                        <li>Sau khi duyệt, {selectedRequest.requestType === 'program' ? 'chương trình' : 'đề thi'} sẽ chuyển sang trạng thái "Đã duyệt"</li>
                        <li>Bạn có thể <strong>thu hồi phê duyệt</strong> nếu phát hiện sai sót (trước khi {selectedRequest.requestType === 'program' ? 'chương trình' : 'đề thi'} được kích hoạt)</li>
                        <li>Vui lòng kiểm tra kỹ nội dung trước khi phê duyệt</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Note input */}
                <div>
                  <label className="form-label fw-semibold">Ghi chú phê duyệt (Tùy chọn)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Thêm ghi chú hoặc nhận xét về việc phê duyệt..."
                    value={approveNote}
                    onChange={(e) => setApproveNote(e.target.value)}
                    disabled={actionLoading}
                  />
                  <small className="text-muted">
                    Ghi chú này sẽ được gửi cho người nộp yêu cầu
                  </small>
                </div>
              </div>
              <div className="modal-footer border-top">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApproveModal(false);
                    setShowDetailModal(true);
                    setApproveNote('');
                  }}
                  disabled={actionLoading}
                >
                  <i className="ph ph-x me-2"></i>
                  Hủy
                </Button>
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  <i className="ph ph-check me-2"></i>
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận duyệt'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">Từ chối yêu cầu</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRejectModal(false);
                    setShowDetailModal(true);
                    setRejectReason('');
                    setReviewNote('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label text-danger">Lý do từ chối *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Nhập lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="form-label">Ghi chú thêm (Tùy chọn)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Thêm ghi chú..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setShowDetailModal(true);
                    setRejectReason('');
                    setReviewNote('');
                  }}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Approval Modal */}
      {showRevokeModal && selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning-subtle">
                <div>
                  <h5 className="modal-title fw-bold text-warning-emphasis">
                    <i className="ph ph-arrow-counter-clockwise me-2"></i>
                    Thu hồi phê duyệt
                  </h5>
                  <p className="text-muted small mb-0 mt-1">
                    Yêu cầu sẽ được chuyển về trạng thái chờ duyệt
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRevokeModal(false);
                    setShowDetailModal(true);
                    setRevokeReason('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                {/* Request Info */}
                <div className="alert alert-warning border-warning mb-4">
                  <div className="d-flex align-items-start">
                    <i className="ph ph-warning-circle fs-4 me-3 mt-1"></i>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-2">Thông tin yêu cầu</h6>
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block">Loại:</small>
                          <strong>{getRequestTypeName(selectedRequest.requestType)}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Tên:</small>
                          <strong>{selectedRequest.entityId?.program_name || selectedRequest.entityId?.name || selectedRequest.entityId?.title || 'N/A'}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Người nộp:</small>
                          <strong>{selectedRequest.requestedBy?.username || selectedRequest.requestedBy?.name}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Đã duyệt lúc:</small>
                          <strong>{formatDate(selectedRequest.processedAt)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning about revocation */}
                <div className="alert alert-danger border-danger mb-4">
                  <div className="d-flex align-items-start">
                    <i className="ph ph-warning fs-4 me-3 mt-1"></i>
                    <div>
                      <h6 className="fw-bold mb-2 text-danger">Lưu ý khi thu hồi phê duyệt</h6>
                      <ul className="mb-0 ps-3">
                        <li>Yêu cầu sẽ chuyển về trạng thái <strong>"Chờ duyệt"</strong></li>
                        <li>{selectedRequest.requestType === 'program' ? 'Chương trình' : 'Đề thi'} sẽ chuyển về trạng thái <strong>"Chờ phê duyệt"</strong></li>
                        <li>Bạn có thể duyệt lại hoặc từ chối yêu cầu này sau khi thu hồi</li>
                        <li>Hành động này sẽ được ghi lại trong lịch sử</li>
                        <li className="text-danger fw-bold">Chỉ thu hồi được nếu {selectedRequest.requestType === 'program' ? 'chương trình' : 'đề thi'} chưa được kích hoạt</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Revocation reason */}
                <div>
                  <label className="form-label text-danger fw-semibold">
                    Lý do thu hồi phê duyệt *
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Nhập lý do thu hồi phê duyệt (ví dụ: Phát hiện sai sót trong nội dung, cần kiểm tra lại...)"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <small className="text-muted">
                    Lý do này sẽ được gửi cho người nộp yêu cầu và lưu trong lịch sử
                  </small>
                </div>
              </div>
              <div className="modal-footer border-top">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRevokeModal(false);
                    setShowDetailModal(true);
                    setRevokeReason('');
                  }}
                  disabled={actionLoading}
                >
                  <i className="ph ph-x me-2"></i>
                  Hủy
                </Button>
                <Button
                  variant="warning"
                  onClick={handleRevoke}
                  disabled={actionLoading || !revokeReason.trim()}
                >
                  <i className="ph ph-arrow-counter-clockwise me-2"></i>
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận thu hồi'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Request Modal */}
      {showCancelModal && selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger-subtle">
                <div>
                  <h5 className="modal-title fw-bold text-danger">
                    <i className="ph ph-x-circle me-2"></i>
                    Xác nhận hủy yêu cầu
                  </h5>
                  <p className="text-muted small mb-0 mt-1">
                    Vui lòng xác nhận hành động hủy yêu cầu công việc
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCancelModal(false);
                    setShowDetailModal(true);
                    setDeleteLinkedEntity(false);
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                {/* Request Summary */}
                <div className="alert alert-warning border-warning mb-4">
                  <div className="d-flex align-items-start">
                    <i className="ph ph-info fs-4 me-3 mt-1"></i>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-2">Thông tin yêu cầu</h6>
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block">Loại:</small>
                          <strong>{getRequestTypeName(selectedRequest.requestType)}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Trạng thái:</small>
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Người được giao:</small>
                          <strong>{selectedRequest.assignedTo?.username || selectedRequest.assignedTo?.name || 'N/A'}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Ngày giao:</small>
                          <strong>{formatDate(selectedRequest.requestedAt)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning about cancellation */}
                <div className="alert alert-danger border-danger mb-4">
                  <div className="d-flex align-items-start">
                    <i className="ph ph-warning fs-4 me-3 mt-1"></i>
                    <div>
                      <h6 className="fw-bold mb-2 text-danger">Lưu ý khi hủy yêu cầu</h6>
                      <ul className="mb-0 ps-3">
                        <li>Yêu cầu sẽ bị xóa hoàn toàn khỏi hệ thống</li>
                        <li>Người được giao sẽ không thể tiếp tục làm việc với yêu cầu này</li>
                        <li>Hành động này <strong>KHÔNG THỂ HOÀN TÁC</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Linked Program/Entity Info */}
                {selectedRequest.entityId && (
                  <div className="alert alert-info border-info mb-4">
                    <div className="d-flex align-items-start">
                      <i className="ph ph-database fs-4 me-3 mt-1"></i>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-2">
                          {selectedRequest.requestType === 'create_program' ? 'Program' : 'Entity'} đã được tạo
                        </h6>
                        <p className="mb-2">
                          <strong>Tên:</strong> {selectedRequest.entityId?.program_name || selectedRequest.entityId?.name || selectedRequest.entityId?.title}
                        </p>
                        <p className="mb-2">
                          <strong>Mã:</strong> {selectedRequest.entityId?.code || 'N/A'}
                        </p>
                        <p className="mb-0">
                          <strong>Trạng thái:</strong> {selectedRequest.entityId?.status || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Entity Option */}
                {selectedRequest.entityId && (
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-3">
                      Xử lý {selectedRequest.requestType === 'create_program' ? 'Program' : 'Entity'} liên quan
                    </h6>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="deleteEntityOption"
                        id="keepEntity"
                        checked={!deleteLinkedEntity}
                        onChange={() => setDeleteLinkedEntity(false)}
                        disabled={actionLoading}
                      />
                      <label className="form-check-label" htmlFor="keepEntity">
                        <strong>Giữ lại {selectedRequest.requestType === 'create_program' ? 'program' : 'entity'}</strong>
                        <p className="text-muted small mb-0">
                          {selectedRequest.requestType === 'create_program' ? 'Program' : 'Entity'} sẽ được giữ lại trong hệ thống với trạng thái hiện tại.
                          Subject Leader có thể tiếp tục chỉnh sửa hoặc xóa nếu cần.
                        </p>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="deleteEntityOption"
                        id="deleteEntity"
                        checked={deleteLinkedEntity}
                        onChange={() => setDeleteLinkedEntity(true)}
                        disabled={actionLoading}
                      />
                      <label className="form-check-label" htmlFor="deleteEntity">
                        <strong className="text-danger">Xóa {selectedRequest.requestType === 'create_program' ? 'program' : 'entity'}</strong>
                        <p className="text-muted small mb-0">
                          {selectedRequest.requestType === 'create_program' ? 'Program' : 'Entity'} sẽ bị xóa khỏi hệ thống.
                          <span className="text-danger fw-semibold"> Chỉ áp dụng nếu trạng thái là draft hoặc needs_revision.</span>
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {!selectedRequest.entityId && (
                  <div className="alert alert-secondary border-secondary">
                    <i className="ph ph-info me-2"></i>
                    Yêu cầu này chưa có {selectedRequest.requestType === 'create_program' ? 'program' : 'entity'} được tạo.
                  </div>
                )}
              </div>
              <div className="modal-footer border-top">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelModal(false);
                    setShowDetailModal(true);
                    setDeleteLinkedEntity(false);
                  }}
                  disabled={actionLoading}
                >
                  <i className="ph ph-arrow-left me-2"></i>
                  Quay lại
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelRequest}
                  disabled={actionLoading}
                >
                  <i className="ph ph-x-circle me-2"></i>
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Work Request Modal */}
      <CreateWorkRequestModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateWorkRequest}
        requestType={createRequestType}
        assigneeList={assigneeList}
      />

      {/* Toast Container */}
      <ToastContainer />

    </div>
  );
};

export default ApprovalRequests;
