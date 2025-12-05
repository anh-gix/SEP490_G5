import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

/**
 * TeacherStats Component
 * Hiển thị 4 stats cards cho quản lý giảng viên
 */
const TeacherStats = ({ stats }) => {
  return (
    <Row className="g-3 mb-24">
      <Col md={3}>
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-20">
            <div className="d-flex align-items-center gap-16">
              <div 
                className="rounded-12 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
                }}
              >
                <i className="fas fa-chalkboard-teacher text-white" style={{ fontSize: '24px' }}></i>
              </div>
              <div>
                <div className="text-neutral-500 text-13 mb-4">Tổng giảng viên</div>
                <div className="text-neutral-900 fw-bold text-32">{stats.total || 0}</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3}>
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-20">
            <div className="d-flex align-items-center gap-16">
              <div 
                className="rounded-12 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                <i className="fas fa-user-check text-white" style={{ fontSize: '24px' }}></i>
              </div>
              <div>
                <div className="text-neutral-500 text-13 mb-4">Đang hoạt động</div>
                <div className="text-neutral-900 fw-bold text-32">{stats.active || 0}</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3}>
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-20">
            <div className="d-flex align-items-center gap-16">
              <div 
                className="rounded-12 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                }}
              >
                <i className="fas fa-door-open text-white" style={{ fontSize: '24px' }}></i>
              </div>
              <div>
                <div className="text-neutral-500 text-13 mb-4">Tổng lớp</div>
                <div className="text-neutral-900 fw-bold text-32">{stats.totalClasses || 0}</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3}>
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-20">
            <div className="d-flex align-items-center gap-16">
              <div 
                className="rounded-12 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                }}
              >
                <i className="fas fa-user-slash text-white" style={{ fontSize: '24px' }}></i>
              </div>
              <div>
                <div className="text-neutral-500 text-13 mb-4">Tạm nghỉ</div>
                <div className="text-neutral-900 fw-bold text-32">{stats.inactive || 0}</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TeacherStats;

