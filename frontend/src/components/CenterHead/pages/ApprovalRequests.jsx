import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from '../compo/Card';
import Button from '../compo/Button';
import { workRequestService } from '../../../services/workRequestService';
import { academicWorkRequestService } from '../../../services/academicWorkRequestService';
import { formatDate } from '../../../helper/helper';
import CreateWorkRequestModal from '../compo/CreateWorkRequestModal';
import userService from '../../../services/userService';

const ApprovalRequests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bottom_up'); // 'bottom_up' or 'top_down'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

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
  }, [activeTab, statusFilter, typeFilter, fromDate, toDate, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchStats();
  }, []);

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
      if (typeFilter && typeFilter !== 'all') {
        params.requestType = typeFilter;
      }
      if (fromDate) {
        params.fromDate = fromDate;
      }
      if (toDate) {
        params.toDate = toDate;
      }

      const response = await workRequestService.getAllRequests(params);

      if (response.success) {
        setRequests(response.data);
        if (response.pagination) {
          setTotalItems(response.pagination.total);
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await workRequestService.getStats();
      if (response.success) {
        const data = response.data;

        // Bottom-up stats
        const bottomUpStats = data.byDirection?.bottom_up || {};
        // Top-down stats
        const topDownStats = data.byDirection?.top_down || {};

        setStats({
          // Bottom-up
          pendingApprovals: bottomUpStats.pending || 0,
          approved: bottomUpStats.approved || 0,
          rejected: bottomUpStats.rejected || 0,
          // Top-down
          pendingTasks: topDownStats.pending || 0,
          inProgressTasks: topDownStats.in_progress || 0,
          pendingApprovalTasks: topDownStats.pending_approval || 0,
          completedTasks: topDownStats.completed || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
        toast.success('Đã duyệt yêu cầu thành công!', {
          position: 'top-right'
        });
        setShowApproveModal(false);
        setShowDetailModal(false);
        setApproveNote('');
        setSelectedRequest(null);
        fetchRequests();
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi duyệt yêu cầu', {
        position: 'top-right'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      toast.warning('Vui lòng nhập lý do yêu cầu chỉnh sửa', {
        position: 'top-right'
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await workRequestService.rejectRequest(selectedRequest._id, {
        rejectionReason: rejectReason.trim(),
        responseNote: reviewNote.trim() || undefined
      });

      if (response.success) {
        toast.success('Đã yêu cầu chỉnh sửa thành công!', {
          position: 'top-right'
        });
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectReason('');
        setReviewNote('');
        setSelectedRequest(null);
        fetchRequests();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi yêu cầu chỉnh sửa', {
        position: 'top-right'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedRequest || !revokeReason.trim()) {
      toast.warning('Vui lòng nhập lý do thu hồi phê duyệt', {
        position: 'top-right'
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await workRequestService.revokeApproval(selectedRequest._id, {
        reason: revokeReason.trim()
      });

      if (response.success) {
        toast.success('Đã thu hồi phê duyệt thành công! Yêu cầu đã chuyển về trạng thái chờ duyệt.', {
          position: 'top-right'
        });
        setShowRevokeModal(false);
        setShowDetailModal(false);
        setRevokeReason('');
        setSelectedRequest(null);
        fetchRequests();
        fetchStats();
      }
    } catch (error) {
      console.error('Error revoking approval:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi thu hồi phê duyệt', {
        position: 'top-right'
      });
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
        fetchStats();
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
        fetchStats();
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

  const handleResetFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setFromDate('');
    setToDate('');
    setSearchQuery('');
    setCurrentPage(1);
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
          <h2 className="fw-bold mb-2">Quản lý yêu cầu</h2>
          <p className="text-muted mb-0">Phê duyệt và theo dõi tiến độ công việc</p>
        </div>
        {activeTab === 'top_down' && (
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
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="mb-4">
        <ul className="nav nav-tabs nav-tabs-custom">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'bottom_up' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('bottom_up');
                setCurrentPage(1);
                setStatusFilter('all');
              }}
            >
              <i className="ph ph-arrow-circle-up me-2"></i>
              Yêu cầu phê duyệt
              {stats.pendingApprovals > 0 && (
                <span className="badge bg-warning text-dark ms-2 rounded-pill">
                  {stats.pendingApprovals}
                </span>
              )}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'top_down' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('top_down');
                setCurrentPage(1);
                setStatusFilter('all');
              }}
            >
              <i className="ph ph-arrow-circle-down me-2"></i>
              Công việc đã giao
              {(stats.pendingTasks + stats.inProgressTasks + stats.pendingApprovalTasks) > 0 && (
                <span className="badge bg-info text-dark ms-2 rounded-pill">
                  {stats.pendingTasks + stats.inProgressTasks + stats.pendingApprovalTasks}
                </span>
              )}
            </button>
          </li>
        </ul>
      </div>

      {/* Stats Cards Section */}
      {activeTab === 'bottom_up' ? (
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <Card>
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small mb-1">Chờ duyệt</div>
                    <div className="h3 fw-bold text-warning mb-0">{stats.pendingApprovals}</div>
                  </div>
                  <div className="text-warning" style={{ fontSize: '2.5rem', opacity: 0.2 }}>
                    <i className="ph ph-clock"></i>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-md-4">
            <Card>
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small mb-1">Đã duyệt</div>
                    <div className="h3 fw-bold text-success mb-0">{stats.approved}</div>
                  </div>
                  <div className="text-success" style={{ fontSize: '2.5rem', opacity: 0.2 }}>
                    <i className="ph ph-check-circle"></i>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-md-4">
            <Card>
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small mb-1">Từ chối</div>
                    <div className="h3 fw-bold text-danger mb-0">{stats.rejected}</div>
                  </div>
                  <div className="text-danger" style={{ fontSize: '2.5rem', opacity: 0.2 }}>
                    <i className="ph ph-x-circle"></i>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <Card>
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
            <Card>
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
            <Card>
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small mb-1">Chờ duyệt lại</div>
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
            <Card>
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
      )}

      {/* Filters Section */}
      <Card className="mb-4">
        <div className="p-3">
          {/* Basic Filters - Always visible */}
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-6">
              <label className="form-label fw-medium">Tìm kiếm</label>
              <input
                type="text"
                className="form-control"
                placeholder={activeTab === 'bottom_up' ? "Tìm theo tên, người nộp..." : "Tìm theo tên, người được giao..."}
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
                {activeTab === 'bottom_up' ? (
                  <>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                  </>
                ) : (
                  <>
                    <option value="pending">Chưa nhận</option>
                    <option value="in_progress">Đang làm</option>
                    <option value="pending_approval">Chờ duyệt lại</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="completed">Hoàn thành</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Advanced Filter Toggle Button */}
          <div className="mt-3">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            >
              <i className={`ph ${showAdvancedFilter ? 'ph-caret-up' : 'ph-caret-down'} me-2`}></i>
              {showAdvancedFilter ? 'Ẩn bộ lọc nâng cao' : 'Bộ lọc nâng cao'}
            </button>
          </div>

          {/* Advanced Filters - Collapsible */}
          {showAdvancedFilter && (
            <div className="mt-3 pt-3 border-top">
              <div className="row g-3">
                {/* Type Filter */}
                <div className="col-md-4">
                  <label className="form-label fw-medium">Loại</label>
                  <select
                    className="form-select"
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">Tất cả</option>
                    {activeTab === 'bottom_up' ? (
                      <>
                        <option value="program">Chương trình</option>
                        <option value="exam">Đề thi</option>
                      </>
                    ) : (
                      <>
                        <option value="create_program">Tạo chương trình</option>
                        <option value="edit_course">Chỉnh sửa khóa học</option>
                        <option value="create_exam">Tạo đề thi</option>
                        <option value="assign_students">Sắp xếp học viên</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Date Range */}
                <div className="col-md-4">
                  <label className="form-label fw-medium">Từ ngày</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-medium">Đến ngày</label>
                  <input
                    type="date"
                    className="form-control"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    min={fromDate}
                  />
                </div>

                {/* Reset Button */}
                <div className="col-12">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleResetFilters}
                  >
                    <i className="ph ph-arrow-clockwise me-2"></i>
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Requests Table Section */}
      <Card className="mb-4">
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
                  <th className="fw-semibold">{activeTab === 'bottom_up' ? 'Người nộp' : 'Người được giao'}</th>
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
                      {activeTab === 'bottom_up' ? (
                        <>
                          <div className="fw-medium">{request.requestedBy?.username || request.requestedBy?.name || 'N/A'}</div>
                          <small className="text-muted">{request.requestedBy?.email || ''}</small>
                        </>
                      ) : (
                        <>
                          <div className="fw-medium">{request.assignedTo?.username || request.assignedTo?.name || 'Chưa giao'}</div>
                          <small className="text-muted">{request.assignedTo?.email || ''}</small>
                        </>
                      )}
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
        <Card>
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
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header border-bottom">
                <div>
                  <h5 className="modal-title fw-bold mb-1">Chi tiết yêu cầu</h5>
                  <p className="text-muted small mb-0">
                    {selectedRequest.entityId?.program_name || selectedRequest.entityId?.name || selectedRequest.entityId?.title || 'N/A'}
                  </p>
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
                {/* Direction Badge */}
                <div className="mb-3">
                  <span className={`badge ${selectedRequest.direction === 'bottom_up' ? 'bg-info' : 'bg-purple'} text-white px-3 py-2`}>
                    <i className={`ph ${selectedRequest.direction === 'bottom_up' ? 'ph-arrow-circle-up' : 'ph-arrow-circle-down'} me-2`}></i>
                    {selectedRequest.direction === 'bottom_up' ? 'Yêu cầu phê duyệt' : 'Công việc được giao'}
                  </span>
                </div>

                {/* Status and Type */}
                <div className="row g-3 mb-4 pb-4 border-bottom">
                  <div className="col-6">
                    <label className="form-label text-muted small text-uppercase fw-semibold">Trạng thái</label>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small text-uppercase fw-semibold">Loại</label>
                    <p className="mb-0 fw-medium">{getRequestTypeName(selectedRequest.requestType)}</p>
                  </div>
                </div>

                {/* Entity Info */}
                {selectedRequest.entityId && (
                  <div className="mb-4 pb-4 border-bottom">
                    <h6 className="fw-semibold mb-3">
                      <i className="ph ph-info me-2"></i>
                      Thông tin {selectedRequest.entityType}
                    </h6>
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label text-muted small text-uppercase">Tên</label>
                        <p className="mb-0">{selectedRequest.entityId?.program_name || selectedRequest.entityId?.name || selectedRequest.entityId?.title}</p>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small text-uppercase">Mã</label>
                        <p className="mb-0">{selectedRequest.entityId?.code || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={handleViewEntityDetail}
                      >
                        <i className="ph ph-arrow-square-out me-2"></i>
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                )}

                {/* Request Info */}
                <div className="mb-4 pb-4 border-bottom">
                  <h6 className="fw-semibold mb-3">
                    <i className="ph ph-user me-2"></i>
                    Thông tin yêu cầu
                  </h6>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label text-muted small text-uppercase">Người tạo</label>
                      <p className="mb-0 fw-medium">{selectedRequest.requestedBy?.username || selectedRequest.requestedBy?.name}</p>
                      <small className="text-muted">{selectedRequest.requestedBy?.email}</small>
                    </div>
                    {selectedRequest.direction === 'top_down' && selectedRequest.assignedTo && (
                      <div className="col-6">
                        <label className="form-label text-muted small text-uppercase">Người được giao</label>
                        <p className="mb-0 fw-medium">{selectedRequest.assignedTo?.username || selectedRequest.assignedTo?.name}</p>
                        <small className="text-muted">{selectedRequest.assignedTo?.email}</small>
                      </div>
                    )}
                    <div className="col-6">
                      <label className="form-label text-muted small text-uppercase">Ngày tạo</label>
                      <p className="mb-0">{formatDate(selectedRequest.requestedAt)}</p>
                    </div>
                  </div>
                  {selectedRequest.requestNote && (
                    <div className="mt-3">
                      <label className="form-label text-muted small text-uppercase">Ghi chú</label>
                      <div className="p-3 bg-light rounded border">
                        {selectedRequest.requestNote}
                      </div>
                    </div>
                  )}
                </div>

                {/* Response Info (if processed) */}
                {selectedRequest.processedBy && (
                  <div className="mb-4 pb-4 border-bottom">
                    <h6 className="fw-semibold mb-3">
                      <i className="ph ph-check-square me-2"></i>
                      Thông tin xử lý
                    </h6>
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label text-muted small text-uppercase">Người xử lý</label>
                        <p className="mb-0 fw-medium">{selectedRequest.processedBy?.username || selectedRequest.processedBy?.name}</p>
                        <small className="text-muted">{selectedRequest.processedBy?.email}</small>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small text-uppercase">Ngày xử lý</label>
                        <p className="mb-0">{formatDate(selectedRequest.processedAt)}</p>
                      </div>
                    </div>
                    {selectedRequest.responseNote && (
                      <div className="mt-3">
                        <label className="form-label text-muted small text-uppercase">Phản hồi</label>
                        <div className="p-3 bg-light rounded border">
                          {selectedRequest.responseNote}
                        </div>
                      </div>
                    )}
                    {selectedRequest.rejectionReason && (
                      <div className="mt-3">
                        <label className="form-label text-danger small text-uppercase fw-semibold">Lý do từ chối</label>
                        <div className="p-3 bg-danger-subtle rounded border border-danger">
                          {selectedRequest.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Revocation Info (if revoked) */}
                {selectedRequest.revocation?.revokedBy && (
                  <div className="mb-4 pb-4 border-bottom">
                    <h6 className="fw-semibold mb-3 text-warning">
                      <i className="ph ph-arrow-counter-clockwise me-2"></i>
                      Thông tin thu hồi phê duyệt
                    </h6>
                    <div className="alert alert-warning border-warning">
                      <div className="row g-3">
                        <div className="col-6">
                          <label className="form-label text-muted small text-uppercase">Người thu hồi</label>
                          <p className="mb-0 fw-medium">{selectedRequest.revocation.revokedBy?.username || selectedRequest.revocation.revokedBy?.name || 'N/A'}</p>
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small text-uppercase">Ngày thu hồi</label>
                          <p className="mb-0">{formatDate(selectedRequest.revocation.revokedAt)}</p>
                        </div>
                      </div>
                      {selectedRequest.revocation.revocationReason && (
                        <div className="mt-3">
                          <label className="form-label text-warning-emphasis small text-uppercase fw-semibold">Lý do thu hồi</label>
                          <div className="p-3 bg-white rounded border border-warning">
                            {selectedRequest.revocation.revocationReason}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Output Files */}
                {selectedRequest.outputFiles && selectedRequest.outputFiles.length > 0 && (
                  <div className="mb-4 pb-4 border-bottom">
                    <h6 className="fw-semibold mb-3">
                      <i className="ph ph-files me-2"></i>
                      File báo cáo từ giáo vụ ({selectedRequest.outputFiles.length})
                    </h6>
                    <div className="row g-3">
                      {selectedRequest.outputFiles.map((file, index) => (
                        <div key={index} className="col-md-6 col-lg-4">
                          <div className="border border-neutral-200 rounded p-3 bg-light h-100">
                            <div className="d-flex align-items-start" style={{ width: '100%' }}>
                              <i className="fas fa-file text-primary mt-1 me-2" style={{ fontSize: '18px', flexShrink: 0, width: '20px' }}></i>
                              <div style={{ flex: '1 1 auto', minWidth: 0, maxWidth: 'calc(100% - 60px)' }}>
                                <div 
                                  className="text-neutral-900 fw-medium" 
                                  title={file.fileName}
                                  style={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    lineHeight: '1.4'
                                  }}
                                >
                                  {file.fileName}
                                </div>
                                <small className="text-muted d-block" style={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap'
                                }}>
                                  {(file.fileSize / 1024).toFixed(2)} KB • {formatDate(file.uploadedAt)}
                                </small>
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="ms-2"
                                style={{ flexShrink: 0, width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => academicWorkRequestService.downloadFile(file.fileUrl)}
                                title="Tải xuống"
                              >
                                <i className="fas fa-download"></i>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* History */}
                {selectedRequest.history && selectedRequest.history.length > 0 && (
                  <div>
                    <h6 className="fw-semibold mb-3">
                      <i className="ph ph-clock-counter-clockwise me-2"></i>
                      Lịch sử
                    </h6>
                    <div className="vstack gap-3">
                      {selectedRequest.history.map((entry, idx) => (
                        <div key={idx} className="p-3 bg-light rounded border">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <p className="mb-1 fw-medium text-capitalize">
                                {entry.action} bởi {entry.performedBy?.username || entry.performedBy?.name}
                              </p>
                              <small className="text-muted">
                                {formatDate(entry.performedAt)}
                              </small>
                            </div>
                            {entry.previousStatus && (
                              <small className="text-muted text-capitalize">
                                {entry.previousStatus} → {entry.action}
                              </small>
                            )}
                          </div>
                          {entry.note && (
                            <p className="mt-2 mb-0 text-muted fst-italic small">{entry.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer - Actions */}
              {/* Actions for pending requests */}
              {((activeTab === 'bottom_up' && selectedRequest.status === 'pending') ||
                (activeTab === 'top_down' && selectedRequest.status === 'pending_approval')) && (
                <div className="modal-footer border-top">
                  <Button
                    variant="success"
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowApproveModal(true);
                    }}
                  >
                    <i className="ph ph-check me-2"></i>
                    Duyệt
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowRejectModal(true);
                    }}
                  >
                    <i className="ph ph-x me-2"></i>
                    Yêu cầu chỉnh sửa
                  </Button>
                </div>
              )}

              {/* Actions for approved requests - Revoke option */}
              {activeTab === 'bottom_up' && selectedRequest.status === 'approved' && (
                <div className="modal-footer border-top bg-light">
                  <div className="w-100">
                    <div className="alert alert-info mb-3">
                      <i className="ph ph-info me-2"></i>
                      Yêu cầu này đã được duyệt. Bạn có thể thu hồi phê duyệt nếu phát hiện sai sót.
                    </div>
                    <div className="d-flex justify-content-end">
                      <Button
                        variant="warning"
                        onClick={() => {
                          setShowDetailModal(false);
                          setShowRevokeModal(true);
                        }}
                      >
                        <i className="ph ph-arrow-counter-clockwise me-2"></i>
                        Thu hồi phê duyệt
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions for top-down pending/in_progress requests - Cancel option */}
              {activeTab === 'top_down' && ['pending', 'in_progress'].includes(selectedRequest.status) && (
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
                          setShowDetailModal(false);
                          setShowCancelModal(true);
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
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
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
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Yêu cầu chỉnh sửa</h5>
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
                  <label className="form-label text-danger">Lý do yêu cầu chỉnh sửa *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Nhập lý do yêu cầu chỉnh sửa..."
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
                  {actionLoading ? 'Đang xử lý...' : 'Yêu cầu chỉnh sửa'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Approval Modal */}
      {showRevokeModal && selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
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
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
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

      <style jsx>{`
        .nav-tabs-custom {
          border-bottom: 2px solid #dee2e6;
        }
        .nav-tabs-custom .nav-link {
          border: none;
          color: #6c757d;
          padding: 1rem 1.5rem;
          font-weight: 500;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }
        .nav-tabs-custom .nav-link:hover {
          color: #0d6efd;
          background-color: #f8f9fa;
        }
        .nav-tabs-custom .nav-link.active {
          color: #0d6efd;
          border-bottom-color: #0d6efd;
          background-color: transparent;
        }
        .bg-purple {
          background-color: #6f42c1;
        }
      `}</style>
    </div>
  );
};

export default ApprovalRequests;
