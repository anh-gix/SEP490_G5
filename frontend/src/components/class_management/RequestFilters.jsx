import React from 'react';
import { Card, Row, Col, Form, InputGroup } from 'react-bootstrap';

/**
 * RequestFilters Component
 * Component filters và search cho quản lý đơn
 */
const RequestFilters = ({
  searchTerm,
  filterStatus,
  sortBy,
  onSearchChange,
  onFilterStatusChange,
  onSortChange
}) => {
  return (
    <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
      <Card.Body className="p-20">
        <Row className="g-3 align-items-center">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="bg-neutral-50 border-neutral-200">
                <i className="fas fa-search text-neutral-600"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Tìm theo nội dung đơn hoặc người gửi..."
                value={searchTerm}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                }}
                className="border-neutral-200"
              />
            </InputGroup>
          </Col>

          <Col md={3}>
            <Form.Select 
              value={filterStatus}
              onChange={(e) => {
                onFilterStatusChange(e.target.value);
              }}
              className="border-neutral-200"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Select 
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="border-neutral-200"
            >
              <option value="oldest">Cũ nhất trước</option>
              <option value="newest">Mới nhất trước</option>
              <option value="sender">Theo người gửi (A-Z)</option>
            </Form.Select>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RequestFilters;

