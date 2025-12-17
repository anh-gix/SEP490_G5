import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import StepIndicator from '../compo/exam/StepIndicator';
import Step1BasicInfo from '../compo/exam/Step1BasicInfo';
import Step2AddSections from '../compo/exam/Step2AddSections';
import Step3AnswerKeys from '../compo/exam/Step3AnswerKeys';
import Step4Publish from '../compo/exam/Step4Publish';
import examService from '../../../services/examService';

const ExamCreateWizard = ({ viewMode = 'center-head' }) => {
  const navigate = useNavigate();
  const basePath = viewMode === 'teacher' ? '/teacher' : '/center-head';
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    examType: 'cambridge',
    level: 'Academic',
    totalDuration: 0,
    sections: [],
    isPublished: false,
    lastCompletedStep: 0
  });
  const [examId, setExamId] = useState(null); // Store exam ID after creation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { number: 1, title: 'Create New Exam', label: 'Basic Information' },
    { number: 2, title: 'Add Sections', label: 'Exam Sections' },
    { number: 3, title: 'Add Answer Keys', label: 'Answer Keys' },
    { number: 4, title: 'Publish', label: 'Publish Exam' }
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', path: `${basePath}/dashboard` },
    { label: 'Quản lý đề thi', path: `${basePath}/exams` },
    { label: 'Tạo đề thi mới' }
  ];

  // Save exam to backend
  const handleSaveExam = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate exam data
      const validation = examService.validateExamData(examData);
      if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return false;
      }

      // Format exam data
      const formattedData = examService.formatExamData(examData);

      // Create or update exam
      let response;
      if (examId) {
        response = await examService.updateExamForManagement(examId, formattedData);
      } else {
        response = await examService.createExamForManagement(formattedData);
        if (response.success && response.data._id) {
          setExamId(response.data._id);
        }
      }

      if (response.success) {
        console.log('Exam saved successfully:', response.data);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error saving exam:', err);
      setError(err.message || 'Lưu đề thi thất bại');
      alert(err.message || 'Lưu đề thi thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Save draft - lưu nháp với lastCompletedStep
  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update lastCompletedStep based on current step
      const updatedData = {
        ...examData,
        lastCompletedStep: currentStep
      };
      setExamData(updatedData);

      // Format exam data
      const formattedData = examService.formatExamData(updatedData);

      // Create or update exam
      let response;
      if (examId) {
        response = await examService.updateExamForManagement(examId, formattedData);
      } else {
        response = await examService.createExamForManagement(formattedData);
        if (response.success && response.data._id) {
          setExamId(response.data._id);
        }
      }

      if (response.success) {
        alert('Lưu nháp thành công!');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(err.message || 'Lưu nháp thất bại');
      alert(err.message || 'Lưu nháp thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      // Auto-save and update lastCompletedStep when moving to next step
      const updatedData = {
        ...examData,
        lastCompletedStep: currentStep
      };
      setExamData(updatedData);

      // Save exam data when moving from step 2 or 3
      if (currentStep >= 2) {
        const formattedData = examService.formatExamData(updatedData);

        let response;
        if (examId) {
          response = await examService.updateExamForManagement(examId, formattedData);
        } else {
          response = await examService.createExamForManagement(formattedData);
          if (response.success && response.data._id) {
            setExamId(response.data._id);
          }
        }

        if (!response.success) return;
      }

      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Tất cả dữ liệu sẽ bị mất.')) {
      navigate(`${basePath}/exams`);
    }
  };

  // Complete exam creation - Step 4
  const handleCompleteExam = async () => {
    try {
      setLoading(true);

      // Update lastCompletedStep to 4 (all steps completed)
      const updatedData = {
        ...examData,
        lastCompletedStep: 4
      };

      const formattedData = examService.formatExamData(updatedData);

      let response;
      if (examId) {
        response = await examService.updateExamForManagement(examId, formattedData);
      } else {
        response = await examService.createExamForManagement(formattedData);
      }

      if (response.success) {
        alert('Hoàn tất tạo đề thi! Bạn có thể publish hoặc submit để duyệt từ danh sách đề thi.');
        navigate(`${basePath}/exams`);
      }
    } catch (err) {
      console.error('Error completing exam:', err);
      alert(err.message || 'Hoàn tất thất bại');
    } finally {
      setLoading(false);
    }
  };

  const updateExamData = (updates) => {
    setExamData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const calculateTotals = () => {
    const totalDuration = examData.sections.reduce((sum, section) =>
      sum + (parseInt(section.duration) || 0), 0
    );
    const totalQuestions = examData.sections.reduce((sum, section) =>
      sum + (section.answerKey?.length || 0), 0
    );
    const totalScore = examData.sections.reduce((sum, section) => {
      const sectionScore = section.answerKey?.reduce((sSum, answer) =>
        sSum + (parseFloat(answer.maxScore) || 0), 0
      ) || 0;
      return sum + sectionScore;
    }, 0);

    return { totalDuration, totalQuestions, totalScore };
  };

  const { totalDuration, totalQuestions, totalScore } = calculateTotals();

  // Validation for each step
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return examData.title.trim() !== '' && examData.totalDuration > 0;
      case 2:
        return examData.sections.length > 0;
      case 3:
        // Check if all sections have answer keys (for reading/listening)
        return examData.sections.every(section => {
          if (section.type === 'reading' || section.type === 'listening') {
            return section.answerKey && section.answerKey.length > 0;
          }
          return true;
        });
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="exam-create-wizard-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Tạo đề thi mới</h4>
          <p className="text-neutral-600 mb-0">
            Tạo đề thi IELTS với các section và đáp án
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <Card className="mb-24">
        <StepIndicator steps={steps} currentStep={currentStep} />
      </Card>

      <div className="row g-4">
        {/* Main Content Area */}
        <div className="col-12 col-lg-8">
          <Card>
            {/* Error Display */}
            {error && (
              <div className="alert alert-danger mb-24" role="alert">
                <div className="d-flex align-items-center gap-2">
                  <i className="ph ph-warning-circle"></i>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Step Title */}
            <div className="mb-24">
              <h5 className="text-neutral-900 fw-bold mb-8">
                {steps[currentStep - 1].title}
              </h5>
              <p className="text-neutral-600 text-sm mb-0">
                {currentStep === 1 && 'Nhập thông tin cơ bản cho đề thi của bạn'}
                {currentStep === 2 && 'Thêm các section và tải lên file PDF đề thi'}
                {currentStep === 3 && 'Thêm đáp án cho từng section'}
                {currentStep === 4 && 'Xem lại thông tin và xuất bản đề thi'}
              </p>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <Step1BasicInfo
                examData={examData}
                updateExamData={updateExamData}
              />
            )}

            {currentStep === 2 && (
              <Step2AddSections
                examData={examData}
                updateExamData={updateExamData}
              />
            )}

            {currentStep === 3 && (
              <Step3AnswerKeys
                examData={examData}
                updateExamData={updateExamData}
              />
            )}

            {currentStep === 4 && (
              <Step4Publish
                examData={examData}
                totalDuration={totalDuration}
                totalQuestions={totalQuestions}
                totalScore={totalScore}
                onSave={handleCompleteExam}
                examId={examId}
              />
            )}

            {/* Navigation Buttons */}
            <div className="d-flex align-items-center justify-content-between mt-24 pt-24 border-top border-neutral-200">
              <Button
                variant="outline"
                icon="ph ph-caret-left"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Quay lại
              </Button>

              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Hủy
                </Button>

                {/* Nút Lưu nháp - hiển thị ở Step 1, 2, 3 */}
                {currentStep < 4 && (
                  <Button
                    variant="outline-primary"
                    icon="ph ph-floppy-disk"
                    onClick={handleSaveDraft}
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu nháp'}
                  </Button>
                )}

                {currentStep < 4 && (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        Tiếp theo
                        <i className="ph ph-caret-right ms-2"></i>
                      </>
                    )}
                  </Button>
                )}

                {/* Nút hoàn tất ở Step 4 */}
                {currentStep === 4 && (
                  <Button
                    variant="success"
                    icon="ph ph-check-circle"
                    onClick={handleCompleteExam}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : (
                      'Hoàn tất'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Exam Summary */}
        <div className="col-12 col-lg-4">
          <div className="sticky-top" style={{ top: '24px' }}>
            <Card title="Tóm tắt đề thi">
              {/* Exam Title */}
              <div className="mb-20">
                <div className="text-neutral-500 mb-8 text-sm">Tên đề thi</div>
                <div className="text-neutral-900 fw-semibold">
                  {examData.title || <span className="text-neutral-400 fst-italic">Chưa đặt tên</span>}
                </div>
              </div>

              {/* Exam Type */}
              <div className="mb-20">
                <div className="text-neutral-500 mb-8 text-sm">Loại đề thi</div>
                <div className="text-neutral-900 fw-semibold">
                  {examData.examType === 'cambridge' && 'Cambridge'}
                  {examData.examType === 'ielts' && 'IELTS'}
                  {examData.examType === 'toeic' && 'TOEIC'}
                </div>
              </div>

              {/* Level */}
              <div className="mb-20">
                <div className="text-neutral-500 mb-8 text-sm">Cấp độ</div>
                <div className="text-neutral-900 fw-semibold">{examData.level}</div>
              </div>

              {/* Publish Status */}
              <div className="mb-20">
                <div className="text-neutral-500 mb-8 text-sm">Trạng thái hiển thị</div>
                <span className={`badge ${examData.isPublished ? 'bg-success' : 'bg-primary'}`}>
                  {examData.isPublished ? (
                    <>
                      <i className="ph ph-globe me-1"></i>
                      Public
                    </>
                  ) : (
                    <>
                      <i className="ph ph-users me-1"></i>
                      Private
                    </>
                  )}
                </span>
              </div>

              {/* Statistics */}
              <div className="border-top border-neutral-200 pt-20">
                <div className="row g-3 text-center">
                  <div className="col-6">
                    <div className="text-neutral-500 mb-4 text-sm">Sections</div>
                    <div className="text-neutral-900 fw-bold h4 mb-0">{examData.sections.length}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-neutral-500 mb-4 text-sm">Câu hỏi</div>
                    <div className="text-neutral-900 fw-bold h4 mb-0">{totalQuestions}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-neutral-500 mb-4 text-sm">Thời gian</div>
                    <div className="text-neutral-900 fw-bold h4 mb-0">
                      {totalDuration || examData.totalDuration || 0}
                      <small className="text-sm fw-normal ms-1">phút</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-neutral-500 mb-4 text-sm">Điểm</div>
                    <div className="text-neutral-900 fw-bold h4 mb-0">{totalScore}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCreateWizard;
