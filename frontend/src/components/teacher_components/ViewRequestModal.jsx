import { useState } from 'react';
import Modal from '../CenterHead/compo/Modal';
import Button from '../CenterHead/compo/Button';
import StatusBadge from '../CenterHead/compo/StatusBadge';
import { formatDate } from '../../helper/helper';
import workRequestService from '../../services/workRequestService';
import { useNavigate } from 'react-router-dom';

/**
 * ViewRequestModal - Modal hiển thị chi tiết work request
 *
 * @param {boolean} show - Hiển thị modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {object} request - Work request object
 * @param {function} onRequestUpdated - Callback khi request được cập nhật
 */
const ViewRequestModal = ({ show, onClose, request, onRequestUpdated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!request) return null;

  const handleStartProcessing = async () => {
    try {
      setLoading(true);

      // Call API to start processing - sẽ tự động tạo program draft
      const response = await workRequestService.startProcessing(request._id);

      console.log('Start processing response:', response);

      // Close modal
      onClose();

      // Notify parent to refresh data
      if (onRequestUpdated) {
        onRequestUpdated();
      }

      // Navigate đến trang edit program đã được tạo
      if (response.programId) {
        navigate(`/teacher/programs/${response.programId}/edit`);
      } else {
        // Fallback (không nên xảy ra)
        console.warn('No programId returned, navigating to create page');
        navigate('/teacher/programs/create');
      }
    } catch (error) {
      console.error('Error starting processing:', error);
      alert(error.message || 'Không thể bắt đầu xử lý yêu cầu!');
    } finally {
      setLoading(false);
    }
  };

  const getRequestTypeLabel = (type) => {
    const types = {
      'create_program': 'Tạo chương trình mới',
      'edit_course': 'Chỉnh sửa khóa học',
      'create_exam': 'Tạo đề thi mới',
      'assign_students': 'Cấp tài khoản học viên'
    };
    return types[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'in_progress': 'info',
      'completed': 'success',
      'approved': 'success',
      'rejected': 'danger'
    };
    return colors[status] || 'secondary';
  };

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <div className="modal-header border-bottom">
        <h5 className="modal-title fw-bold">
          <i className="ph ph-clipboard-text me-2"></i>
          Chi tiết yêu cầu công việc
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        />
      </div>

      <div className="modal-body">
        <div className="row g-4">
          {/* Request Type */}
          <div className="col-12">
            <div className="card bg-light border-0">
              <div className="card-body">
                <h6 className="text-neutral-600 mb-2">Loại yêu cầu</h6>
                <div className="d-flex align-items-center gap-2">
                  <i className="ph ph-clipboard-text text-primary fs-4"></i>
                  <span className="fw-semibold text-neutral-900">
                    {getRequestTypeLabel(request.requestType)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="col-md-6">
            <label className="form-label text-neutral-600 mb-2">Trạng thái</label>
            <div>
              <StatusBadge status={request.status} size="md" />
            </div>
          </div>

          {/* Requested At */}
          <div className="col-md-6">
            <label className="form-label text-neutral-600 mb-2">Ngày giao việc</label>
            <div className="d-flex align-items-center gap-2">
              <i className="ph ph-calendar text-neutral-500"></i>
              <span className="text-neutral-900">{formatDate(request.requestedAt)}</span>
            </div>
          </div>

          {/* Requested By */}
          <div className="col-12">
            <label className="form-label text-neutral-600 mb-2">Người giao việc (Center Head)</label>
            <div className="card border">
              <div className="card-body py-2">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '40px', height: '40px' }}>
                    <i className="ph ph-user text-primary fs-5"></i>
                  </div>
                  <div>
                    <div className="fw-semibold text-neutral-900">
                      {request.requestedBy?.username || 'N/A'}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {request.requestedBy?.email || ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Note */}
          <div className="col-12">
            <label className="form-label text-neutral-600 mb-2">
              <i className="ph ph-note me-1"></i>
              Ghi chú yêu cầu
            </label>
            <div className="card border bg-light">
              <div className="card-body">
                <p className="mb-0 text-neutral-900" style={{ whiteSpace: 'pre-wrap' }}>
                  {request.requestNote || 'Không có ghi chú'}
                </p>
              </div>
            </div>
          </div>

          {/* Attachment File */}
          {request.attachmentFile && (
            <div className="col-12">
              <label className="form-label text-neutral-600 mb-2">
                <i className="ph ph-paperclip me-1"></i>
                Tài liệu đính kèm
              </label>
              <div className="card border">
                <div className="card-body py-2">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className="ph ph-file-text text-primary fs-4"></i>
                      <div>
                        <div className="fw-medium text-neutral-900">
                          {request.attachmentFile.fileName}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {(request.attachmentFile.fileSize / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <a
                      href={request.attachmentFile.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="ph ph-download me-1"></i>
                      Tải xuống
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History (if available) */}
          {request.history && request.history.length > 0 && (
            <div className="col-12">
              <label className="form-label text-neutral-600 mb-2">
                <i className="ph ph-clock-counter-clockwise me-1"></i>
                Lịch sử
              </label>
              <div className="card border">
                <div className="card-body">
                  <div className="timeline">
                    {request.history.slice().reverse().map((item, index) => (
                      <div key={index} className="timeline-item d-flex gap-3 mb-3">
                        <div className="timeline-marker">
                          <div className={`bg-${getStatusColor(item.action)} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                               style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                            <i className={`ph ph-${item.action === 'assigned' ? 'user-plus' : item.action === 'in_progress' ? 'play' : item.action === 'completed' ? 'check' : 'clock'} text-${getStatusColor(item.action)}`}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-medium text-neutral-900">
                            {item.action === 'assigned' && 'Được giao việc'}
                            {item.action === 'in_progress' && 'Bắt đầu xử lý'}
                            {item.action === 'completed' && 'Hoàn thành'}
                            {item.action === 'submitted' && 'Đã nộp'}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {formatDate(item.performedAt)}
                          </div>
                          {item.note && (
                            <div className="text-sm text-neutral-700 mt-1">
                              {item.note}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer border-top">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Đóng
        </Button>
        {request.status === 'pending' && (
          <Button
            variant="success"
            icon="ph ph-play"
            onClick={handleStartProcessing}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang xử lý...
              </>
            ) : (
              'Bắt đầu xử lý'
            )}
          </Button>
        )}
        {request.status === 'in_progress' && (
          <Button
            variant="primary"
            icon="ph ph-pencil"
            onClick={() => {
              onClose();
              // Navigate đến program đã được tạo
              if (request.entityId) {
                const programId = typeof request.entityId === 'object' ? request.entityId._id : request.entityId;
                navigate(`/teacher/programs/${programId}/edit`);
              } else {
                alert('Chưa có program được tạo cho request này.');
              }
            }}
            disabled={!request.entityId}
          >
            Tiếp tục tạo program
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default ViewRequestModal;
