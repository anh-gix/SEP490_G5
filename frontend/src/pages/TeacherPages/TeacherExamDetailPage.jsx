import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherExamDetail from '../../components/teacher_components/TeacherExamDetail';

const TeacherExamDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1 py-24 px-24" style={{ backgroundColor: '#f8f9fa', overflow: 'auto', height: '100vh' }}>
        <TeacherExamDetail basePath="/teacher" />
      </div>
    </div>
  );
};

export default TeacherExamDetailPage;
