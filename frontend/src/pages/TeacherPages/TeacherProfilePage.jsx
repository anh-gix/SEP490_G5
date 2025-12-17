import TeacherNavigation from '../../components/teacher_components/TeacherNavigation'; 
import Profile from "../../components/Authen/Profile";
import React from 'react';

const TeacherProfilePage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1 py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <Profile />
      </div>
    </div>

  );
};

export default TeacherProfilePage;