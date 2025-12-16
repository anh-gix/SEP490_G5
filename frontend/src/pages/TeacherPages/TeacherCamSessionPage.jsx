import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import CamSession from '../../components/CenterHead/pages/CamSession';

/**
 * Teacher CAM Session Page
 * Page tạo CAM Session cho giảng viên
 */
const TeacherCamSessionPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <CamSession viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherCamSessionPage;
