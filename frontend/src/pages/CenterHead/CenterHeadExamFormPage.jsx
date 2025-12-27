import CenterHeadLayout from '../../components/CenterHead/layout/CenterHeadLayout';
import CenterHeadExamWizard from '../../components/CenterHead/pages/exam/CenterHeadExamWizard';

/**
 * CenterHeadExamFormPage - Trang tạo/sửa đề thi cho Center Head
 * Sử dụng riêng CenterHeadExamWizard (tách biệt với Teacher)
 */
const CenterHeadExamFormPage = () => {
  return (
    <CenterHeadLayout>
      <CenterHeadExamWizard />
    </CenterHeadLayout>
  );
};

export default CenterHeadExamFormPage;
