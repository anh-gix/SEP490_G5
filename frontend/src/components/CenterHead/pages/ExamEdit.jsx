import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import StepIndicator from '../compo/exam/StepIndicator';
import Step1BasicInfo from '../compo/exam/Step1BasicInfo';
import Step2AddSections from '../compo/exam/Step2AddSections';
import Step3AnswerKeys from '../compo/exam/Step3AnswerKeys';
import examService from '../../../services/examService';

const ExamEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    examType: 'practice',
    level: 'Academic',
    totalDuration: 0,
    sections: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { number: 1, title: 'Edit Exam', label: 'Basic Information' },
    { number: 2, title: 'Edit Sections', label: 'Exam Sections' },
    { number: 3, title: 'Edit Answer Keys', label: 'Answer Keys' }
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý đề thi', path: '/center-head/exams' },
    { label: 'Chỉnh sửa đề thi' }
  ];

  useEffect(() => {
    fetchExamDetails();
  }, [id]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const response = await examService.getExamByIdForManagement(id);

      if (response.success) {
        const exam = response.data;
        setExamData({
          title: exam.title || '',
          description: exam.description || '',
          examType: exam.examType || 'practice',
          level: exam.level || 'Academic',
          totalDuration: exam.totalDuration || 0,
          sections: exam.sections || []
        });
      } else {
        setError(response.message || 'Không thể tải thông tin đề thi');
        alert(response.message || 'Không thể tải thông tin đề thi');
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError(err.message || 'Không thể tải thông tin đề thi');
      alert(err.message || 'Không thể tải thông tin đề thi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate exam data
      const validation = examService.validateExamData(examData);
      if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return false;
      }

      // Format exam data
      const formattedData = examService.formatExamData(examData);

      // Update exam
      const response = await examService.updateExamForManagement(id, formattedData);

      if (response.success) {
        alert('Cập nhật đề thi thành công!');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error saving exam:', err);
      setError(err.message || 'Cập nhật đề thi thất bại');
      alert(err.message || 'Cập nhật đề thi thất bại');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    const saved = await handleSaveExam();
    if (saved) {
      navigate(`/center-head/exams/${id}`);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Các thay đổi chưa lưu sẽ bị mất.')) {
      navigate(`/center-head/exams/${id}`);
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
        return examData.sections.every(section => {
          if (section.type === 'reading' || section.type === 'listening') {
            return section.answerKey && section.answerKey.length > 0;
          }
          return true;
        });
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-main-600" role="status" />
      </div>
    );
  }

  if (error && !examData.title) {
    return (
      <div className="exam-edit-container">
        <Breadcrumb items={breadcrumbItems} />
        <Card>
          <div className="alert alert-danger mb-0">
            <i className="ph ph-warning-circle me-2"></i>
            {error || 'Không thể tải thông tin đề thi'}
          </div>
          <div className="mt-3">
            <Button variant="outline" onClick={() => navigate('/center-head/exams')}>
              <i className="ph ph-arrow-left me-2"></i>
              Quay lại danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="exam-edit-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Chỉnh sửa đề thi</h4>
          <p className="text-neutral-600 mb-0">
            Cập nhật thông tin và nội dung đề thi
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
                {currentStep === 1 && 'Cập nhật thông tin cơ bản cho đề thi'}
                {currentStep === 2 && 'Chỉnh sửa các section và file đề thi'}
                {currentStep === 3 && 'Cập nhật đáp án cho từng section'}
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

                <Button
                  variant="success"
                  icon="ph ph-floppy-disk"
                  onClick={handleSaveAndExit}
                  disabled={saving || !canProceed()}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      Lưu và Thoát
                    </>
                  )}
                </Button>

                {currentStep < 3 && (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Tiếp theo
                    <i className="ph ph-caret-right ms-2"></i>
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
                  {examData.examType === 'practice' ? 'Luyện tập' : 'Chính thức'}
                </div>
              </div>

              {/* Level */}
              <div className="mb-20">
                <div className="text-neutral-500 mb-8 text-sm">Cấp độ</div>
                <div className="text-neutral-900 fw-semibold">{examData.level}</div>
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

export default ExamEdit;
