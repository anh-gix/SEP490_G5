import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { formatDate } from '../../utils/requestHelpers';

/**
 * RejectRequestModal Component
 * Modal từ chối đơn
 */
const RejectRequestModal = ({
  show,
  onHide,
  request,
  rejectReason,
  onRejectReasonChange,
  onConfirm,
  processing
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Từ chối đơn</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {request && (
          <div className="mb-16">
            <p className="text-neutral-700 mb-8">
              <strong>Người gửi:</strong> {request.sender?.username} ({request.sender?.email})
            </p>
            <p className="text-neutral-700 mb-8">
              <strong>Ngày gửi:</strong> {formatDate(request.createdAt)}
            </p>
            <p className="text-neutral-700 mb-16">
              <strong>Nội dung đơn:</strong> {request.content}
            </p>
          </div>
        )}
        <Form.Group>
          <Form.Label>Lý do từ chối (không bắt buộc)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={rejectReason}
            onChange={(e) => onRejectReasonChange(e.target.value)}
            placeholder="Nhập lý do từ chối (nếu có)..."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={processing}
        >
          Hủy
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm} 
          disabled={processing}
        >
          {processing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RejectRequestModal;

