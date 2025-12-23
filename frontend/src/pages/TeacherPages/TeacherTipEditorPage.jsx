import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TipEditor from '../../components/teacher_components/TipEditor';

/**
 * Teacher Tip Editor Page
 * Layout page cho chỉnh sửa tips
 */
const TeacherTipEditorPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1 py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <TipEditor />
      </div>
    </div>
  );
};

export default TeacherTipEditorPage;
