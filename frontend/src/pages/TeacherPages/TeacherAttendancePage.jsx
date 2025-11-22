import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherAttendance from '../../components/teacher_components/TeacherAttendance';

/**
 * Teacher Attendance Page
 * Layout page cho điểm danh học viên
 */
const TeacherAttendancePage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <TeacherAttendance />
      </div>
    </div>
  );
};

export default TeacherAttendancePage;
