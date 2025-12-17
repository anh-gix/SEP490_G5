import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import CamSessionEdit from '../../components/CenterHead/pages/CamSessionEdit';

/**
 * Teacher CAM Session Edit Page
 * Page sửa CAM Session cho giảng viên
 */
const TeacherCamSessionEditPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1 py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <CamSessionEdit viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherCamSessionEditPage;
