import React, { useState } from 'react';
import StepIndicator from '../compo/exam/StepIndicator';
import Step1BasicInfo from '../compo/exam/Step1BasicInfo';
import Step2AddSections from '../compo/exam/Step2AddSections';
import Step3AnswerKeys from '../compo/exam/Step3AnswerKeys';
import Step4Publish from '../compo/exam/Step4Publish';

const ExamCreateWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    examType: 'practice',
    level: 'Academic',
    totalDuration: 0,
    sections: []
  });

  const steps = [
    { number: 1, title: 'Create New Exam', label: 'Basic Information' },
    { number: 2, title: 'Add Sections', label: 'Exam Sections' },
    { number: 3, title: 'Add Answer Keys', label: 'Answer Keys' },
    { number: 4, title: 'Publish', label: 'Publish Exam' }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
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
      window.history.back();
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
    <div className="min-h-screen bg-neutral-50 py-32 px-24">
      <div className="container-xxl max-w-1400">
        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="row g-24 mt-32">
          {/* Main Content Area */}
          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-16 border border-neutral-200 p-32">
              {/* Step Title */}
              <div className="mb-32">
                <h4 className="text-neutral-900 fw-bold mb-8">
                  {steps[currentStep - 1].title}
                </h4>
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
                />
              )}

              {/* Navigation Buttons */}
              <div className="d-flex align-items-center justify-content-between mt-32 pt-32 border-top border-neutral-200">
                <button
                  className="btn btn-outline-neutral px-24 py-12 radius-8 text-sm fw-medium"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <i className="fas fa-arrow-left me-8"></i>
                  Previous
                </button>

                <div className="d-flex gap-12">
                  <button
                    className="btn btn-outline-neutral px-24 py-12 radius-8 text-sm fw-medium"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>

                  {currentStep < 4 ? (
                    <button
                      className="btn btn-main px-32 py-12 radius-8 text-sm fw-semibold"
                      onClick={handleNext}
                      disabled={!canProceed()}
                    >
                      Next
                      <i className="fas fa-arrow-right ms-8"></i>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Exam Summary */}
          <div className="col-12 col-lg-4">
            <div className="sticky-top" style={{ top: '24px' }}>
              <div className="bg-white rounded-16 border border-neutral-200 p-24">
                <h6 className="text-neutral-900 fw-semibold mb-24 text-md">Exam Summary</h6>

                {/* Exam Title */}
                <div className="mb-20">
                  <div className="text-neutral-500 mb-8 text-xs">Exam Title</div>
                  <div className="text-neutral-900 fw-medium text-sm">
                    {examData.title || <span className="text-neutral-400">Not set</span>}
                  </div>
                </div>

                {/* Exam Type */}
                <div className="mb-20">
                  <div className="text-neutral-500 mb-8 text-xs">Exam Type</div>
                  <div className="text-neutral-900 fw-medium text-sm">
                    {examData.examType === 'practice' ? 'Practice' : 'Real Exam'}
                  </div>
                </div>

                {/* Level */}
                <div className="mb-20">
                  <div className="text-neutral-500 mb-8 text-xs">Level</div>
                  <div className="text-neutral-900 fw-medium text-sm">{examData.level}</div>
                </div>

                {/* Statistics */}
                <div className="border-top border-neutral-200 pt-20">
                  <div className="mb-16">
                    <div className="d-flex justify-content-between align-items-center mb-8">
                      <span className="text-neutral-500 text-xs">Sections</span>
                      <span className="text-neutral-900 fw-bold text-lg">{examData.sections.length}</span>
                    </div>
                  </div>

                  <div className="mb-16">
                    <div className="d-flex justify-content-between align-items-center mb-8">
                      <span className="text-neutral-500 text-xs">Total Questions</span>
                      <span className="text-neutral-900 fw-bold text-lg">{totalQuestions}</span>
                    </div>
                  </div>

                  <div className="mb-16">
                    <div className="d-flex justify-content-between align-items-center mb-8">
                      <span className="text-neutral-500 text-xs">Duration</span>
                      <span className="text-neutral-900 fw-bold text-lg">
                        {totalDuration || examData.totalDuration || 0} <span className="text-xs fw-normal">minutes</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCreateWizard;
