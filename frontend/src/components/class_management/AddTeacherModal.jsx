import React from 'react';
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap';

/**
 * AddTeacherModal Component
 * Modal form thêm giảng viên mới
 */
const AddTeacherModal = ({
  show,
  onHide,
  formData,
  formErrors,
  loading,
  onSubmit,
  onInputChange
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thêm Giảng viên mới</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {formErrors.submit && (
            <Alert variant="danger" className="mb-3">
              {formErrors.submit}
            </Alert>
          )}
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tên người dùng <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={onInputChange}
                  placeholder="Username"
                  required
                  isInvalid={!!formErrors.username}
                />
                {formErrors.username && (
                  <Form.Control.Feedback type="invalid">
                    {formErrors.username}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onInputChange}
                  placeholder="email@example.com"
                  required
                  isInvalid={!!formErrors.email}
                />
                {formErrors.email && (
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                    Mật khẩu
                    <span className="text-muted" style={{ fontSize: '12px', fontWeight: 'normal' }}>
                      {' '}(Mặc định: 123456)
                    </span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={onInputChange}
                    placeholder="Để trống sẽ dùng mật khẩu mặc định: 123456"
                    isInvalid={!!formErrors.password}
                  />
                  {formErrors.password && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.password}
                    </Form.Control.Feedback>
                  )}
                  <Form.Text className="text-muted">
                    Nếu không nhập, mật khẩu mặc định sẽ là: <strong>123456</strong>
                  </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={onInputChange}
                  placeholder="0123456789"
                  required
                  isInvalid={!!formErrors.phone}
                />
                {formErrors.phone && (
                  <Form.Control.Feedback type="invalid">
                    {formErrors.phone}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={onInputChange}
                  placeholder="Địa chỉ liên hệ..."
                  required
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Thêm mới'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddTeacherModal;

