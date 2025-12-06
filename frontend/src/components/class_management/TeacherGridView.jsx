import React from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';

/**
 * TeacherGridView Component
 * Component hiển thị grid view của giảng viên
 */
const TeacherGridView = ({ teachers, onViewDetail }) => {
  const getStatusBadge = (status) => {
    const config = {
      active: { bg: 'bg-success-600', text: 'Hoạt động', icon: 'fa-check-circle' },
      inactive: { bg: 'bg-danger-600', text: 'Tạm nghỉ', icon: 'fa-times-circle' }
    };
    const { bg, text, icon } = config[status] || config.active;
    return (
      <Badge className={`${bg} text-white px-12 py-6`}>
        <i className={`fas ${icon} me-1`}></i>
        {text}
      </Badge>
    );
  };

  if (teachers.length === 0) {
    return (
      <div className="text-center py-40 text-neutral-500">
        Không có giảng viên nào
      </div>
    );
  }

  return (
    <Row className="g-3">
      {teachers.map(teacher => (
        <Col key={teacher._id} lg={4} md={6}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm h-100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-start gap-16 mb-16">
                <div 
                  className="rounded-circle bg-primary-50 d-flex align-items-center justify-content-center"
                  style={{ width: '56px', height: '56px', flexShrink: 0 }}
                >
                  <i className="fas fa-user-tie text-primary" style={{ fontSize: '24px' }}></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-neutral-900 fw-semibold mb-4">{teacher.username}</h6>
                  <p className="text-neutral-600 text-13 mb-0">{teacher.email}</p>
                </div>
                {getStatusBadge(teacher.status)}
              </div>

              <div className="mb-16">
                <div className="d-flex align-items-center gap-8 mb-8">
                  <i className="fas fa-door-open text-neutral-400"></i>
                  <span className="text-neutral-700 text-14">
                    Lớp: {teacher.stats?.classCount || 0} lớp
                  </span>
                </div>
                <div className="d-flex align-items-center gap-8">
                  <i className="fas fa-users text-neutral-400"></i>
                  <span className="text-neutral-700 text-14">
                    Học viên: {teacher.stats?.totalStudents || 0} người
                  </span>
                </div>
              </div>

              <div className="d-flex gap-8">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onViewDetail(teacher)}
                  className="flex-grow-1"
                >
                  <i className="fas fa-eye me-1"></i>
                  Chi tiết
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TeacherGridView;

