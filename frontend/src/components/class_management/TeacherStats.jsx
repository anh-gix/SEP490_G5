import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

/**
 * TeacherStats Component
 * Hiển thị 3 stats cards cho quản lý giảng viên
 */
const TeacherStats = ({ stats, selectedCard = 'total', onCardClick }) => {
  const handleCardClick = (cardType) => {
    if (onCardClick) {
      onCardClick(cardType);
    }
  };

  return (
    <Row className="g-3 mb-24">
      <Col md={4}>
        <Card 
          className="bg-white rounded-12 box-shadow-sm"
          style={{ 
            cursor: 'pointer',
            border: selectedCard === 'total' ? '3px solid #0D74FF' : '1px solid #e5e7eb',
            transition: 'all 0.2s ease'
          }}
          onClick={() => handleCardClick('total')}
        >
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

      <Col md={4}>
        <Card 
          className="bg-white rounded-12 box-shadow-sm"
          style={{ 
            border: '1px solid #e5e7eb'
          }}
        >
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

      <Col md={4}>
        <Card 
          className="bg-white rounded-12 box-shadow-sm"
          style={{ 
            cursor: 'pointer',
            border: selectedCard === 'inactive' ? '3px solid #EF4444' : '1px solid #e5e7eb',
            transition: 'all 0.2s ease'
          }}
          onClick={() => handleCardClick('inactive')}
        >
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
                <div className="text-neutral-500 text-13 mb-4">Giáo viên chưa có lớp</div>
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

