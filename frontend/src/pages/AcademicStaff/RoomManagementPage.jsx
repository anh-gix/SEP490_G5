import React from 'react';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import RoomManagementFull from '../../components/class_management/RoomManagementFullAPI';

/**
 * Room Management Page for Academic Staff - API Integrated
 */
const RoomManagementPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AcademicNavigation />
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <RoomManagementFull />
      </div>
    </div>
  );
};

export default RoomManagementPage;
