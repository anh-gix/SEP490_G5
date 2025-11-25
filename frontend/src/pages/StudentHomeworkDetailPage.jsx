import React from 'react';
import StudentNavigation from '../components/student_components/StudentNavigation.jsx';
import HomeworkDetail from '../components/student_components/HomeworkDetail';

/**
 * StudentHomeworkDetailPage
 * Layout trang chi tiết bài tập với sidebar học viên.
 */
const StudentHomeworkDetailPage = () => (
  <div className="d-flex" style={{ minHeight: '100vh' }}>
    <StudentNavigation />
    <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
      <HomeworkDetail />
    </div>
  </div>
);

export default StudentHomeworkDetailPage;

