import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import StudentNavigation from '../../components/student_components/StudentNavigation';
import StudentDashboard from '../../components/student_components/StudentDashboard';


/**
 * Student Dashboard Page
 * Layout page cho dashboard học viên với sidebar navigation
 */
const StudentDashboardPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-50)' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1">
        <StudentDashboard />
      </div>
    </div>
  );
};

export default StudentDashboardPage;
