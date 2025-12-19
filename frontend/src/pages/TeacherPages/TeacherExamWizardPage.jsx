import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import ExamWizard from '../../components/teacher_components/ExamWizard';

/**
 * Teacher Exam Wizard Page
 * Page tạo/sửa đề thi với wizard 4 bước cho giảng viên
 */
const TeacherExamWizardPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa', overflow: 'auto', height: '100vh' }}>
        <ExamWizard viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherExamWizardPage;
