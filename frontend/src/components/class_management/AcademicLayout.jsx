import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AcademicNavigation from './AcademicNavigation';

/**
 * Academic Layout Component
 * Layout wrapper cho các trang của module Giáo vụ
 * Bao gồm sidebar navigation và content area
 */
const AcademicLayout = ({ children }) => {
  return (
    <Container fluid className="p-0" style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Row className="g-0">
        <Col xs={12} lg={3} xl={2} className="d-none d-lg-block" 
             style={{ 
               position: 'fixed', 
               height: '100vh', 
               overflowY: 'auto',
               background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
               boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
               zIndex: 1000
             }}>
          <AcademicNavigation />
        </Col>
        <Col xs={12} lg={9} xl={10} style={{ marginLeft: 'auto', minHeight: '100vh' }}>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default AcademicLayout;
