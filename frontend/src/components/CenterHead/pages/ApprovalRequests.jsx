import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../compo/Card';
import Button from '../compo/Button';
import approvalRequestService from '../../../services/approvalRequestService';
import { formatDate } from '../../../helper/helper';

const ApprovalRequests = () => {
  const navigate = useNavigate();
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
  const [approveNote, setApproveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter, fromDate, toDate, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage
      };

      // Add filters only if they have values
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (typeFilter && typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (fromDate) {
        params.fromDate = fromDate;
      }
      if (toDate) {
        params.toDate = toDate;
      }

      const response = await approvalRequestService.getPendingRequests(params);

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
      const response = await approvalRequestService.getStats();
      if (response.success) {
        setStats({
          pending: response.data.pending || 0,
          approved: response.data.approved || 0,
          rejected: response.data.rejected || 0
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
      const response = await approvalRequestService.approveRequest(selectedRequest._id, {
        note: approveNote.trim() || undefined
      });

      if (response.success) {
        alert('Đã duyệt yêu cầu thành công!');
        setShowApproveModal(false);
        setShowDetailModal(false);
        setApproveNote('');
        setSelectedRequest(null);
        fetchRequests();
        fetchStats();
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
      const response = await approvalRequestService.rejectRequest(selectedRequest._id, {
        reason: rejectReason.trim(),
        note: reviewNote.trim() || undefined
      });

      if (response.success) {
        alert('Đã từ chối yêu cầu');
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
      alert(error.message || 'Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewProgramDetail = () => {
    if (selectedRequest?.entityId?._id) {
      navigate(`/center-head/programs/${selectedRequest.entityId._id}`);
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
      pending: { class: 'bg-warning-subtle text-warning', text: 'Chờ duyệt' },
      approved: { class: 'bg-success-subtle text-success', text: 'Đã duyệt' },
      rejected: { class: 'bg-danger-subtle text-danger', text: 'Từ chối' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`badge ${badge.class} px-3 py-2 rounded-pill`}>
        {badge.text}
      </span>
    );
  };

  // Filter requests by search query (client-side)
  const filteredRequests = requests.filter(req => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const entityName = req.entityId?.program_name || req.entityId?.name || '';
    const submitterName = req.submittedBy?.name || '';
    const submitterEmail = req.submittedBy?.email || '';

    return (
      entityName.toLowerCase().includes(query) ||
      submitterName.toLowerCase().includes(query) ||
      submitterEmail.toLowerCase().includes(query)
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
      <div className="mb-4 pb-3 border-bottom">
        <h2 className="fw-bold mb-2">Yêu cầu phê duyệt</h2>
        <p className="text-muted mb-0">Quản lý yêu cầu phê duyệt chương trình và đề thi</p>
      </div>

      {/* Stats Cards Section */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <Card>
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small mb-1">Chờ duyệt</div>
                  <div className="h3 fw-bold text-warning mb-0">{stats.pending}</div>
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
                placeholder="Tìm theo tên, người nộp..."
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
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
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
                    <option value="program">Chương trình</option>
                    <option value="exam">Đề thi</option>
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
              {(statusFilter && statusFilter !== 'all') && ` - ${getStatusBadge(statusFilter).props.children}`}
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
                  <th className="fw-semibold">Người nộp</th>
                  <th className="fw-semibold">Trạng thái</th>
                  <th className="fw-semibold">Ngày nộp</th>
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
                        {request.requestType === 'program' ? 'Chương trình' : 'Đề thi'}
                      </span>
                    </td>
                    <td>
                      <div className="fw-medium">{request.entityId?.program_name || request.entityId?.name || 'N/A'}</div>
                      <small className="text-muted">{request.entityType}</small>
                    </td>
                    <td>
                      <div className="fw-medium">{request.submittedBy?.name || 'N/A'}</div>
                      <small className="text-muted">{request.submittedBy?.email || ''}</small>
                    </td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td className="text-muted">{formatDate(request.submittedAt)}</td>
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
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header border-bottom">
                <div>
                  <h5 className="modal-title fw-bold mb-1">Chi tiết yêu cầu</h5>
                  <p className="text-muted small mb-0">
                    {selectedRequest.entityId?.program_name || selectedRequest.entityId?.name}
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
                {/* Status and Type */}
                <div className="row g-3 mb-4 pb-4 border-bottom">
                  <div className="col-6">
                    <label className="form-label text-muted small text-uppercase fw-semibold">Trạng thái</label>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small text-uppercase fw-semibold">Loại</label>
                    <p className="mb-0 fw-medium">
                      {selectedRequest.requestType === 'program' ? 'Chương trình' : 'Đề thi'}
                    </p>
                  </div>
                </div>

                {/* Entity Info */}
                <div className="mb-4 pb-4 border-bottom">
                  <h6 className="fw-semibold mb-3">
                    <i className="ph ph-info me-2"></i>
                    Thông tin {selectedRequest.requestType === 'program' ? 'chương trình' : 'đề thi'}
                  </h6>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label text-muted small text-uppercase">Tên</label>
                      <p className="mb-0">{selectedRequest.entityId?.program_name || selectedRequest.entityId?.name}</p>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small text-uppercase">Mã</label>
                      <p className="mb-0">{selectedRequest.entityId?.code || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedRequest.requestType === 'program' && (
                    <div className="mt-3">
                      <button
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={handleViewProgramDetail}
                      >
                        <i className="ph ph-arrow-square-out me-2"></i>
                        Xem chi tiết chương trình
                      </button>
                    </div>
                  )}
                </div>

                {/* Submission Info */}
                <div className="mb-4 pb-4 border-bottom">
                  <h6 className="fw-semibold mb-3">
                    <i className="ph ph-upload me-2"></i>
                    Thông tin nộp
                  </h6>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label text-muted small text-uppercase">Người nộp</label>
                      <p className="mb-0 fw-medium">{selectedRequest.submittedBy?.name}</p>
                      <small className="text-muted">{selectedRequest.submittedBy?.email}</small>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small text-uppercase">Ngày nộp</label>
                      <p className="mb-0">{formatDate(selectedRequest.submittedAt)}</p>
                    </div>
                  </div>
                  {selectedRequest.submissionNote && (
                    <div className="mt-3">
                      <label className="form-label text-muted small text-uppercase">Ghi chú nộp</label>
                      <div className="p-3 bg-light rounded border">
                        {selectedRequest.submissionNote}
                      </div>
                    </div>
                  )}
                </div>

                {/* Review Info (if reviewed) */}
                {selectedRequest.reviewedBy && (
                  <div className="mb-4 pb-4 border-bottom">
                    <h6 className="fw-semibold mb-3">
                      <i className="ph ph-check-square me-2"></i>
                      Thông tin phê duyệt
                    </h6>
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label text-muted small text-uppercase">Người duyệt</label>
                        <p className="mb-0 fw-medium">{selectedRequest.reviewedBy?.name}</p>
                        <small className="text-muted">{selectedRequest.reviewedBy?.email}</small>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small text-uppercase">Ngày duyệt</label>
                        <p className="mb-0">{formatDate(selectedRequest.reviewedAt)}</p>
                      </div>
                    </div>
                    {selectedRequest.reviewNote && (
                      <div className="mt-3">
                        <label className="form-label text-muted small text-uppercase">Ghi chú phê duyệt</label>
                        <div className="p-3 bg-light rounded border">
                          {selectedRequest.reviewNote}
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
                                {entry.action} bởi {entry.performedBy?.name}
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

              {/* Modal Footer - Actions for Pending */}
              {selectedRequest.status === 'pending' && (
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
                    Từ chối
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Duyệt yêu cầu</h5>
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
                <p className="text-muted mb-3">
                  Bạn có chắc chắn muốn duyệt yêu cầu này không?
                </p>
                <label className="form-label">Ghi chú (Tùy chọn)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Thêm ghi chú cho việc phê duyệt..."
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  disabled={actionLoading}
                />
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApproveModal(false);
                    setShowDetailModal(true);
                    setApproveNote('');
                  }}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
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
    </div>
  );
};

export default ApprovalRequests;
