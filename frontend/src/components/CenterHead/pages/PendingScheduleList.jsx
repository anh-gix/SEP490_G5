import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
// import { scheduleAPI } from '../services/api';
import { mockPendingSchedules, simulateApiDelay } from '../../../helper/mockdata';
import { formatDateTime, formatTime } from '../../../helper/helper';

const PendingSchedulesList = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingSchedules();
  }, []);

  const fetchPendingSchedules = async () => {
    try {
      setLoading(true);
      // Simulate API call with delay
      await simulateApiDelay(600);
      
      // Use mock data
      setSchedules(mockPendingSchedules);
      
      // Real API call (commented out)
      // const response = await scheduleAPI.getPendingSchedules();
      // setSchedules(response.data.schedules || []);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching pending schedules:', err);
      setError('Không thể tải danh sách lịch học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (schedule) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt lịch học này?')) {
      return;
    }

    try {
      setActionLoading(schedule._id);
      // Simulate API call
      await simulateApiDelay(800);
      
      // Real API call (commented out)
      // await scheduleAPI.approveSchedule(schedule._id);
      
      alert('Đã duyệt lịch học thành công!');
      
      // Remove approved schedule from list
      setSchedules(schedules.filter(s => s._id !== schedule._id));
    } catch (err) {
      console.error('Error approving schedule:', err);
      alert('Có lỗi xảy ra khi duyệt lịch học. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setActionLoading(selectedSchedule._id);
      // Simulate API call
      await simulateApiDelay(800);
      
      // Real API call (commented out)
      // await scheduleAPI.rejectSchedule(selectedSchedule._id, { rejectionReason });
      
      alert('Đã từ chối lịch học thành công!');
      setShowRejectModal(false);
      setSelectedSchedule(null);
      setRejectionReason('');
      
      // Remove rejected schedule from list
      setSchedules(schedules.filter(s => s._id !== selectedSchedule._id));
    } catch (err) {
      console.error('Error rejecting schedule:', err);
      alert('Có lỗi xảy ra khi từ chối lịch học. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (schedule) => {
    setSelectedSchedule(schedule);
    setShowRejectModal(true);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Lịch học đặc biệt', path: '/schedules/pending' },
  ];

  const columns = [
    {
      header: 'Lớp học',
      field: 'course',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-4">
            {row.course?.name || 'N/A'}
          </div>
          {row.course?.code && (
            <div className="text-sm text-neutral-600">
              <i className="ph ph-code me-1"></i>
              {row.course.code}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Buổi học',
      field: 'session',
      render: (row) => (
        <span className="text-neutral-900">
          {row.session?.name || row.session?.topic || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Thời gian & Phòng',
      field: 'datetime',
      render: (row) => (
        <div>
          <div className="text-neutral-900 mb-4">
            <i className="ph ph-clock me-1"></i>
            {formatTime(row.startTime)} - {formatTime(row.endTime)}
          </div>
          <div className="text-neutral-900 mb-4">
            <i className="ph ph-calendar me-1"></i>
            {formatDateTime(row.startTime).split(' ')[1]}
          </div>
          <div className="text-sm text-neutral-600">
            <i className="ph ph-map-pin me-1"></i>
            {row.room || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Người gửi',
      field: 'createdBy',
      render: (row) => (
        <div>
          <div className="text-neutral-900">{row.createdBy?.fullname || 'N/A'}</div>
          <div className="text-sm text-neutral-600">{row.createdBy?.email || ''}</div>
        </div>
      ),
    },
    {
      header: 'Lý do',
      field: 'reason',
      render: (row) => (
        <div className="bg-neutral-20 px-12 py-8 radius-4 text-sm text-neutral-700">
          {row.reason || 'Không có lý do'}
        </div>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="success"
            size="sm"
            icon="ph ph-check"
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(row);
            }}
            disabled={actionLoading === row._id}
          >
            Duyệt
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon="ph ph-x"
            onClick={(e) => {
              e.stopPropagation();
              openRejectModal(row);
            }}
            disabled={actionLoading === row._id}
          >
            Từ chối
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-main-600" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-schedules-container">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Lịch học đặc biệt chờ duyệt</h4>
          <p className="text-neutral-600 mb-0">
            Danh sách các lịch học (dạy bù, ngoài giờ) đang chờ phê duyệt từ Giáo vụ
          </p>
        </div>
        <Button
          variant="outline"
          icon="ph ph-arrows-clockwise"
          onClick={fetchPendingSchedules}
        >
          Làm mới
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-24" role="alert">
          <i className="ph ph-warning-circle me-2 text-xl"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="row g-4 mb-24">
        <div className="col-md-4">
          <Card className="bg-main-two-25">
            <div className="d-flex align-items-center gap-3">
              <div className="w-48 h-48 bg-main-two-600 d-flex align-items-center justify-content-center radius-8">
                <i className="ph ph-calendar text-2xl text-white"></i>
              </div>
              <div>
                <h5 className="mb-0 text-neutral-900 fw-bold">{schedules.length}</h5>
                <p className="mb-0 text-neutral-600 text-sm">Tổng lịch học</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table columns={columns} data={schedules} />
      </Card>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Từ chối lịch học</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedSchedule(null);
                    setRejectionReason('');
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                {selectedSchedule && (
                  <div className="mb-16">
                    <div className="bg-neutral-20 p-16 radius-8">
                      <h6 className="mb-8 fw-semibold">{selectedSchedule.course?.name}</h6>
                      <p className="text-sm text-neutral-600 mb-0">
                        <i className="ph ph-clock me-1"></i>
                        {formatDateTime(selectedSchedule.startTime)} - {formatTime(selectedSchedule.endTime)}
                      </p>
                      <p className="text-sm text-neutral-600 mb-0">
                        <i className="ph ph-map-pin me-1"></i>
                        {selectedSchedule.room}
                      </p>
                    </div>
                  </div>
                )}
                <label className="form-label">Lý do từ chối *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Nhập lý do từ chối lịch học..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={actionLoading}
                ></textarea>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedSchedule(null);
                    setRejectionReason('');
                  }}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Từ chối'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingSchedulesList;