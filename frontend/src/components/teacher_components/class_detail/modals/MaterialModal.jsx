import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const MaterialModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Tải lên tài liệu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-16">
            <Form.Label>Tên tài liệu</Form.Label>
            <Form.Control type="text" placeholder="VD: Unit 5 - Grammar Reference" />
          </Form.Group>
          <Form.Group className="mb-16">
            <Form.Label>Loại tài liệu</Form.Label>
            <Form.Select>
              <option value="document">Tài liệu</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="presentation">Presentation</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-16">
            <Form.Label>File</Form.Label>
            <Form.Control type="file" multiple />
            <Form.Text className="text-muted">
              Hỗ trợ: PDF, DOC, PPT, MP3, MP4 (Tối đa 50MB)
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-16">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Mô tả ngắn về tài liệu..." />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn-outline-neutral" onClick={onHide}>
          Hủy
        </Button>
        <Button className="btn-main">
          <i className="fas fa-upload me-2"></i>
          Tải lên
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MaterialModal;
