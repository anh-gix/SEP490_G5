import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

/**
 * RequestStats Component
 * Hiển thị 5 stats cards cho quản lý đơn
 */
const RequestStats = ({ stats, filterType, onFilterTypeChange }) => {
  return (
    <Row className="g-3 mb-24" style={{ display: 'flex', flexWrap: 'wrap' }}>
      {/* Tổng số đơn */}
      <Col xs={12} sm={6} md={4} lg style={{ flex: '1', minWidth: '200px' }}>
        <Card 
          className="bg-white rounded-12 box-shadow-sm"
          style={{ 
            cursor: 'pointer',
            border: filterType === 'all' ? '3px solid #0D74FF' : '2px solid #E5E7EB',
            boxShadow: filterType === 'all' ? '0 4px 16px rgba(13, 116, 255, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            onFilterTypeChange('all');
          }}
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
                <i className="fas fa-clipboard-list text-white" style={{ fontSize: '24px' }}></i>
              </div>
              <div>
                <div className="text-neutral-500 text-13 mb-4">Tổng số đơn</div>
                <div className="text-neutral-900 fw-bold text-32">
                  {(stats.makeupClass || 0) + (stats.requestReplaceTeacher || 0) + (stats.assignStudents || 0)}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Đổi lớp
      <Col xs={12} sm={6} md={4} lg style={{ flex: '1', minWidth: '200px' }}>
        <Card 
          className="bg-white rounded-12 box-shadow-sm"
          style={{ 
            cursor: 'pointer',
            border: filterType === 'change_class' ? '3px solid #6366F1' : '2px solid #E5E7EB',
            boxShadow: filterType === 'change_class' ? '0 4px 16px rgba(99, 102, 241, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            onFilterTypeChange(filterType === 'change_class' ? 'all' : 'change_class');
          }}
        >
          <Card.Body className="p-20">
            <div className="d-flex align-items-center gap-16">
              <div 
                className="rounded-12 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
                }}
              >
                <i className="fas fa-exchange-alt text-white" style={{ fontSize: '24px' }}></i>
              </div>
              <div>
                <div className="text-neutral-500 text-13 mb-4">Đơn đổi lớp</div>
                <div className="text-neutral-900 fw-bold text-32">{stats.changeClass}</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col> */}

      {/* Học bù */}
      <Col xs={12} sm={6} md={4} lg style={{ flex: '1', minWidth: '200px' }}>
        <Card 
          className="bg-white rounded-12 box-shadow-sm"
          style={{ 
            cursor: 'pointer',
            border: filterType === 'makeup_class' ? '3px solid #F59E0B' : '2px solid #E5E7EB',
            boxShadow: filterType === 'makeup_class' ? '0 4px 16px rgba(245, 158, 11, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            onFilterTypeChange(filterType === 'makeup_class' ? 'all' : 'makeup_class');
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
                <i className="fas fa-calendar-plus text-white" style={{ fontSize: '24px' }}></i>
              </div>
              <div>
                <div className="text-neutral-500 text-13 mb-4">Đơn học bù</div>
                <div className="text-neutral-900 fw-bold text-32">{stats.makeupClass}</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Xếp dạy thay */}
      <Col xs={12} sm={6} md={4} lg style={{ flex: '1', minWidth: '200px' }}>
        <Card 
          className="bg-white rounded-12 box-shadow-sm"
          style={{ 
            cursor: 'pointer',
            border: filterType === 'request_replace_teacher' ? '3px solid #6B7280' : '2px solid #E5E7EB',
            boxShadow: filterType === 'request_replace_teacher' ? '0 4px 16px rgba(107, 114, 128, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            onFilterTypeChange(filterType === 'request_replace_teacher' ? 'all' : 'request_replace_teacher');
          }}
        >
          <Card.Body className="p-20">
            <div className="d-flex align-items-center gap-16">
              <div 
                className="rounded-12 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
                }}
              >
                <i className="fas fa-user-friends text-white" style={{ fontSize: '24px' }}></i>
              </div>
              <div>
                <div className="text-neutral-500 text-13 mb-4">Đơn xếp dạy thay</div>
                <div className="text-neutral-900 fw-bold text-32">{stats.requestReplaceTeacher}</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Sắp xếp học viên */}
      <Col xs={12} sm={6} md={4} lg style={{ flex: '1', minWidth: '200px' }}>
        <Card 
          className="bg-white rounded-12 box-shadow-sm"
          style={{ 
            cursor: 'pointer',
            border: filterType === 'assign_students' ? '3px solid #10B981' : '2px solid #E5E7EB',
            boxShadow: filterType === 'assign_students' ? '0 4px 16px rgba(16, 185, 129, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            onFilterTypeChange(filterType === 'assign_students' ? 'all' : 'assign_students');
          }}
        >
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
                <i className="fas fa-user-graduate text-white" style={{ fontSize: '24px' }}></i>
              </div>
              <div>
                <div className="text-neutral-500 text-13 mb-4">Sắp xếp học viên</div>
                <div className="text-neutral-900 fw-bold text-32">{stats.assignStudents || 0}</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RequestStats;

