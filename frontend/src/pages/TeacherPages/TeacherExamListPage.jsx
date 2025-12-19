import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherExamList from '../../components/teacher_components/TeacherExamList';

/**
 * Teacher Exam List Page
 * Page hiển thị danh sách đề thi cho giảng viên
 */
const TeacherExamListPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa', overflow: 'auto', height: '100vh' }}>
        <TeacherExamList />
      </div>
    </div>
  );
};

export default TeacherExamListPage;