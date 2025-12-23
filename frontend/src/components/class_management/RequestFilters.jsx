import React from 'react';
import { Card, Row, Col, Form, InputGroup } from 'react-bootstrap';

/**
 * Status label mappings (Tiếng Việt)
 */
const statusLabels = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang xử lý',
  completed: 'Hoàn thành',
  pending_approval: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  need_revision: 'Yêu cầu chỉnh sửa'
};

const getStatusOptions = (filterType) => {
  // ChangeRequest types - only 3 statuses
  const changeRequestTypes = ['change_class', 'makeup_class', 'request_replace_teacher'];
  
  // WorkRequest types - all 7 statuses (assign_students, create_program, edit_course, create_exam)
  const workRequestTypes = ['assign_students', 'create_program', 'edit_course', 'create_exam'];
  
  if (changeRequestTypes.includes(filterType)) {
    // ChangeRequest: only 3 statuses (pending, approved, rejected)
    // Note: pending label is "Chờ duyệt" for ChangeRequest
    return [
      { value: 'pending', label: 'Chờ duyệt' },
      { value: 'approved', label: 'Đã duyệt' },
      { value: 'rejected', label: 'Từ chối' }
    ];
  } else if (workRequestTypes.includes(filterType)) {
    // WorkRequest types (including assign_students): all 7 WorkRequest statuses
    // Note: pending label is "Chờ xử lý" for WorkRequest (different from ChangeRequest)

    // Special handling for assign_students: only 5 specific statuses
    if (filterType === 'assign_students') {
      return [
        { value: 'pending', label: statusLabels.pending }, // "Chờ xử lý"
        { value: 'in_progress', label: statusLabels.in_progress }, // "Đang xử lý"
        { value: 'pending_approval', label: statusLabels.pending_approval }, // "Chờ duyệt"
        { value: 'need_revision', label: statusLabels.need_revision }, // "Yêu cầu chỉnh sửa"
        { value: 'completed', label: statusLabels.completed } // "Hoàn thành"
      ];
    }

    // Other WorkRequest types: include all statuses
    return [
      { value: 'pending', label: statusLabels.pending }, // "Chờ xử lý"
      { value: 'in_progress', label: statusLabels.in_progress }, // "Đang xử lý"
      { value: 'completed', label: statusLabels.completed }, // "Hoàn thành"
      { value: 'pending_approval', label: statusLabels.pending_approval }, // "Chờ duyệt"
      { value: 'approved', label: statusLabels.approved }, // "Đã duyệt"
      { value: 'rejected', label: statusLabels.rejected }, // "Từ chối"
      { value: 'need_revision', label: statusLabels.need_revision } // "Yêu cầu chỉnh sửa"
    ];
  } else {
    // 'all' or undefined: show common statuses + popular WorkRequest statuses
    return [
      { value: 'pending', label: 'Chờ duyệt' },
      { value: 'in_progress', label: statusLabels.in_progress },
      { value: 'completed', label: statusLabels.completed },
      { value: 'approved', label: statusLabels.approved },
      { value: 'rejected', label: statusLabels.rejected }
    ];
  }
};

/**
 * RequestFilters Component
 * Component filters và search cho quản lý đơn
 */
const RequestFilters = ({
  searchTerm,
  filterStatus,
  filterType,
  sortBy,
  onSearchChange,
  onFilterStatusChange,
  onSortChange
}) => {
  const statusOptions = getStatusOptions(filterType);

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
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              <option value="sender-desc">Theo người gửi (Z-A)</option>
            </Form.Select>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RequestFilters;

