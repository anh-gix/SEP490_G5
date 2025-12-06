import React from 'react';
import { Card, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';

/**
 * TeacherFilters Component
 * Component filters và search cho quản lý giảng viên
 */
const TeacherFilters = ({
  searchTerm,
  filterStatus,
  programType,
  level,
  viewMode,
  availableTypes,
  availableLevels,
  onSearchChange,
  onFilterStatusChange,
  onProgramTypeChange,
  onLevelChange,
  onViewModeChange
}) => {
  return (
    <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
      <Card.Body className="p-20">
        <Row className="g-3 align-items-center">
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text className="bg-neutral-50 border-neutral-200">
                <i className="fas fa-search text-neutral-600"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Tìm theo tên, email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-neutral-200"
              />
            </InputGroup>
          </Col>

          <Col md={2}>
            <Form.Select 
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="border-neutral-200"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm nghỉ</option>
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Select
              value={programType}
              onChange={(e) => onProgramTypeChange(e.target.value)}
              className="border-neutral-200"
            >
              <option value="">Tất cả chương trình</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'ielts' ? 'IELTS' : type === 'toeic' ? 'TOEIC' : type === 'cam' ? 'Cambridge' : type}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Select
              value={level}
              onChange={(e) => onLevelChange(e.target.value)}
              className="border-neutral-200"
            >
              <option value="">Tất cả cấp độ</option>
              {availableLevels.map(lev => (
                <option key={lev} value={lev}>{lev}</option>
              ))}
            </Form.Select>
          </Col>

          <Col md={4} className="text-end">
            <div className="btn-group">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                onClick={() => onViewModeChange('grid')}
                className="px-16"
              >
                <i className="fas fa-th me-2"></i>
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                onClick={() => onViewModeChange('list')}
                className="px-16"
              >
                <i className="fas fa-list me-2"></i>
                List
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TeacherFilters;

