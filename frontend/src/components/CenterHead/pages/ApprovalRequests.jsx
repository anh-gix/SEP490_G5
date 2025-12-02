import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../compo/Card';
import Button from '../compo/Button';
import approvalRequestService from '../../../services/approvalRequestService';
import { formatDate } from '../../../helper/helper';

const ApprovalRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveNote, setApproveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, typeFilter, searchQuery]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await approvalRequestService.getPendingRequests();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(req => req.requestType === typeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req => {
        const entityName = req.entityId?.program_name || req.entityId?.name || '';
        const submitterName = req.submittedBy?.name || '';
        const submitterEmail = req.submittedBy?.email || '';
        return (
          entityName.toLowerCase().includes(query) ||
          submitterName.toLowerCase().includes(query) ||
          submitterEmail.toLowerCase().includes(query)
        );
      });
    }

    setFilteredRequests(filtered);
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

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

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
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Yêu cầu phê duyệt</h2>
        <p className="text-muted">Quản lý yêu cầu phê duyệt chương trình và đề thi</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card>
            <div className="p-3">
              <div className="text-muted small mb-1">Chờ duyệt</div>
              <div className="h3 fw-bold text-warning mb-0">{pendingCount}</div>
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <div className="p-3">
              <div className="text-muted small mb-1">Đã duyệt</div>
              <div className="h3 fw-bold text-success mb-0">{approvedCount}</div>
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <div className="p-3">
              <div className="text-muted small mb-1">Từ chối</div>
              <div className="h3 fw-bold text-danger mb-0">{rejectedCount}</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="p-3">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-4">
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
            <div className="col-md-4">
              <label className="form-label fw-medium">Trạng thái</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="col-md-4">
              <label className="form-label fw-medium">Loại</label>
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="program">Chương trình</option>
                <option value="exam">Đề thi</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card>
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

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">Chi tiết yêu cầu</h5>
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
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="form-label text-muted small text-uppercase">Trạng thái</label>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small text-uppercase">Loại</label>
                    <p className="mb-0 fw-medium">
                      {selectedRequest.requestType === 'program' ? 'Chương trình' : 'Đề thi'}
                    </p>
                  </div>
                </div>

                {/* Entity Info */}
                <div className="border-top pt-4 mb-4">
                  <h6 className="fw-semibold mb-3">
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
                <div className="border-top pt-4 mb-4">
                  <h6 className="fw-semibold mb-3">Thông tin nộp</h6>
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
                  <div className="border-top pt-4 mb-4">
                    <h6 className="fw-semibold mb-3">Thông tin phê duyệt</h6>
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
                        <label className="form-label text-danger small text-uppercase">Lý do từ chối</label>
                        <div className="p-3 bg-danger-subtle rounded border border-danger">
                          {selectedRequest.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* History */}
                {selectedRequest.history && selectedRequest.history.length > 0 && (
                  <div className="border-top pt-4">
                    <h6 className="fw-semibold mb-3">Lịch sử</h6>
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
                <div className="modal-footer">
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
