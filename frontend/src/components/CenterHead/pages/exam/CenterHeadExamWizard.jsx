import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { examService } from '../../../../services/examService';

// Import step components - CenterHead specific
import CenterHeadExamStep1BasicInfo from './exam-wizard-steps/CenterHeadExamStep1BasicInfo';
import CenterHeadExamStep2SectionsConfig from './exam-wizard-steps/CenterHeadExamStep2SectionsConfig';
import CenterHeadExamStep3UploadAnswerKeys from './exam-wizard-steps/CenterHeadExamStep3UploadAnswerKeys';
import CenterHeadExamStep4Review from './exam-wizard-steps/CenterHeadExamStep4Review';
import CenterHeadExamSuccessModal from './CenterHeadExamSuccessModal';

/**
 * CenterHeadExamWizard - Wizard tạo đề thi cho Center Head
 * - CenterHead có toàn quyền CRUD, không cần work request
 * - Có thể lưu nháp hoặc hoàn thành ngay
 */
const CenterHeadExamWizard = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const isEdit = Boolean(examId);

  const basePath = '/center-head';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'

  // Exam data state
  const [examData, setExamData] = useState({
    _id: null,
    title: '',
    description: '',
    examType: 'cambridge',
    totalDuration: 170,
    sections: [],
    status: 'draft',
    lastCompletedStep: 0,
    createdBy: null,
  });

  // Step configuration
  const steps = [
    {
      number: 1,
      title: 'Thông tin cơ bản',
      icon: 'ph ph-info',
      description: 'Thông tin cơ bản về đề thi'
    },
    {
      number: 2,
      title: 'Sections & Parts',
      icon: 'ph ph-layout',
      description: 'Cấu hình sections và parts'
    },
    {
      number: 3,
      title: 'Upload & Đáp án',
      icon: 'ph ph-upload',
      description: 'Upload files và tạo answer keys'
    },
    {
      number: 4,
      title: 'Review & Hoàn thành',
      icon: 'ph ph-check-circle',
      description: 'Review và hoàn thành đề thi'
    }
  ];

  // Load existing exam if editing
  useEffect(() => {
    const loadExamData = async () => {
      if (!isEdit || !examId) return;

      try {
        setLoading(true);
        const response = await examService.getExamByIdForManagement(examId);
        const exam = response.data;

        setExamData({
          _id: exam._id,
          title: exam.title || '',
          description: exam.description || '',
          examType: exam.examType || 'cambridge',
          totalDuration: exam.totalDuration || 170,
          sections: exam.sections || [],
          status: exam.status || 'draft',
          lastCompletedStep: exam.lastCompletedStep || 0,
          createdBy: exam.createdBy,
        });

        // Set current step based on last completed step
        setCurrentStep(Math.min((exam.lastCompletedStep || 0) + 1, 4));
      } catch (error) {
        console.error('Error loading exam:', error);
        toast.error(error.message || 'Không thể tải dữ liệu đề thi!', { position: 'top-right' });
        navigate(`${basePath}/exams`);
      } finally {
        setLoading(false);
      }
    };

    loadExamData();
  }, [isEdit, examId, navigate, basePath]);

  // Success Modal handlers
  const handleViewExam = () => {
    setShowSuccessModal(false);
    navigate(`${basePath}/exams/${examData._id}/details`);
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    window.location.href = `${basePath}/exams/create`;
  };

  const handleGoToExamList = () => {
    setShowSuccessModal(false);
    navigate(`${basePath}/exams?tab=my-exams`);
  };

  // Auto-save function - creates exam if not exists, updates if exists
  const autoSaveExam = async () => {
    try {
      setAutoSaveStatus('saving');
      const formattedData = examService.formatExamData(examData);

      if (!examData._id) {
        // Create new exam if no _id exists
        console.log('📝 Creating new exam...');
        const response = await examService.createExamForManagement(formattedData);
        if (response.success && response.data) {
          setExamData(prev => ({
            ...prev,
            _id: response.data._id
          }));
          setAutoSaveStatus('saved');
          console.log('✅ Created new exam with ID:', response.data._id);
          return response.data._id;
        }
      } else {
        // Update existing exam
        await examService.updateExamForManagement(examData._id, formattedData);
        setAutoSaveStatus('saved');
        console.log('✅ Auto-saved exam');
      }
    } catch (error) {
      console.error('Error auto-saving exam:', error);
      setAutoSaveStatus('error');
      toast.error('Lỗi khi lưu đề thi!', { position: 'top-right' });
    }
    return examData._id;
  };

  // Auto-save when examData changes (debounced)
  useEffect(() => {
    if (!examData._id || !isEdit) return;

    const timeoutId = setTimeout(() => {
      autoSaveExam();
    }, 3000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examData]);

  // Handle step navigation with auto-save
  const handleNext = async () => {
    if (currentStep < steps.length) {
      const savedId = await autoSaveExam();

      if (!examData._id && savedId) {
        console.log('📝 Exam created, waiting for state update...');
      }

      const updatedData = {
        ...examData,
        _id: savedId || examData._id,
        lastCompletedStep: Math.max(examData.lastCompletedStep, currentStep)
      };
      setExamData(updatedData);

      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber) => {
    if (stepNumber <= examData.lastCompletedStep + 1 && stepNumber >= 1) {
      setCurrentStep(stepNumber);
    }
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    try {
      await autoSaveExam();
      toast.success('Đã lưu nháp đề thi!', { position: 'top-right' });
      navigate(`${basePath}/exams?tab=my-exams`);
    } catch (error) {
      toast.error('Lỗi khi lưu nháp!', { position: 'top-right' });
    }
  };

  // Handle complete - CenterHead có quyền hoàn thành ngay
  const handleComplete = async () => {
    try {
      setAutoSaveStatus('saving');

      // Validate exam has sections
      if (!examData.sections || examData.sections.length === 0) {
        toast.warning('Đề thi cần có ít nhất 1 section để hoàn thành!', { position: 'top-right' });
        return;
      }

      // First, save the current exam state
      if (examData._id) {
        const formattedData = examService.formatExamData(examData);
        await examService.updateExamForManagement(examData._id, formattedData);
      } else {
        // Create if not exists
        await autoSaveExam();
      }

      // Complete the exam (approve it)
      await examService.completeExam(examData._id);

      setAutoSaveStatus('saved');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error completing exam:', error);
      setAutoSaveStatus('error');
      toast.error(error.message || 'Không thể hoàn thành đề thi!', { position: 'top-right' });
    }
  };

  // Get step status
  const getStepStatus = (stepNumber) => {
    if (stepNumber <= examData.lastCompletedStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    if (stepNumber === examData.lastCompletedStep + 1) return 'available';
    return 'locked';
  };

  // Render current step component
  const renderStepContent = () => {
    const commonProps = {
      examData,
      setExamData,
      onNext: handleNext,
      onPrevious: handlePrevious,
      isEdit,
      navigate,
      basePath
    };

    switch (currentStep) {
      case 1:
        return <CenterHeadExamStep1BasicInfo {...commonProps} />;
      case 2:
        return <CenterHeadExamStep2SectionsConfig {...commonProps} />;
      case 3:
        return <CenterHeadExamStep3UploadAnswerKeys {...commonProps} />;
      case 4:
        return (
          <CenterHeadExamStep4Review
            {...commonProps}
            onSaveDraft={handleSaveDraft}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-wizard-container">
      {/* Success Modal */}
      <CenterHeadExamSuccessModal
        show={showSuccessModal}
        examData={examData}
        onViewExam={handleViewExam}
        onCreateAnother={handleCreateAnother}
        onGoToExamList={handleGoToExamList}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">
            {isEdit ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}
          </h4>
          <p className="text-neutral-600 mb-0">
            {isEdit ? 'Cập nhật thông tin đề thi' : 'Tạo đề thi luyện tập mới'}
          </p>
        </div>
        <div className="d-flex gap-2">
          {autoSaveStatus === 'saving' && (
            <span className="badge bg-warning-100 text-warning-600">
              <i className="ph ph-spinner me-1"></i>Đang lưu...
            </span>
          )}
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(`${basePath}/exams?tab=my-exams`)}
          >
            <i className="ph ph-x me-2"></i>Hủy
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card shadow-sm border-0 mb-24">
        <div className="card-body">
          <div className="row g-3">
            {steps.map((step) => {
              const status = getStepStatus(step.number);
              const isClickable = status === 'completed' || status === 'active' || status === 'available';

              return (
                <div key={step.number} className="col-lg col-md-3 col-sm-6">
                  <div
                    className={`wizard-step ${status} ${isClickable ? 'clickable' : ''}`}
                    onClick={() => isClickable && handleStepClick(step.number)}
                    style={{
                      cursor: isClickable ? 'pointer' : 'not-allowed',
                      opacity: isClickable ? 1 : 0.5
                    }}
                  >
                    <div className="d-flex flex-column align-items-center gap-2 position-relative">
                      <div
                        className={`step-circle ${
                          status === 'completed'
                            ? 'bg-success text-white shadow'
                            : status === 'active'
                            ? 'bg-primary text-white shadow-lg'
                            : status === 'available'
                            ? 'bg-light text-primary border border-primary'
                            : 'bg-light text-secondary'
                        }`}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}
                      >
                        {status === 'completed' ? (
                          <i className="ph-fill ph-check-circle"></i>
                        ) : status === 'locked' ? (
                          <i className="ph ph-lock"></i>
                        ) : (
                          <i className={step.icon}></i>
                        )}
                      </div>

                      <div className="text-center">
                        <div className={`fw-bold text-xs mb-1 ${
                          status === 'active' ? 'text-primary' :
                          status === 'completed' ? 'text-success' :
                          'text-secondary'
                        }`}>
                          Bước {step.number}
                        </div>
                        <div className={`text-xs ${
                          status === 'active' ? 'text-dark fw-semibold' :
                          status === 'completed' ? 'text-dark' :
                          'text-secondary'
                        }`}>
                          {step.title}
                        </div>

                        {status === 'active' && (
                          <span className="badge bg-primary-subtle text-primary mt-1" style={{ fontSize: '10px' }}>
                            Đang thực hiện
                          </span>
                        )}
                        {status === 'completed' && (
                          <span className="badge bg-success-subtle text-success mt-1" style={{ fontSize: '10px' }}>
                            <i className="ph ph-check me-1"></i>
                            Hoàn thành
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data Summary Card */}
      {examData._id && (
        <div className="alert alert-light border d-flex align-items-start gap-3 mb-24">
          <i className="ph ph-info text-primary fs-4"></i>
          <div className="flex-grow-1">
            <div className="fw-semibold text-dark mb-2">Thông tin đề thi</div>
            <div className="row g-2" style={{ fontSize: '13px' }}>
              <div className="col-md-3">
                <span className="text-secondary">Tên:</span>
                <span className="fw-semibold text-dark ms-2">{examData.title || 'Chưa có'}</span>
              </div>
              <div className="col-md-3">
                <span className="text-secondary">Loại:</span>
                <span className="fw-semibold text-dark ms-2 text-uppercase">{examData.examType}</span>
              </div>
              <div className="col-md-3">
                <span className="text-secondary">Sections:</span>
                <span className="fw-semibold text-primary ms-2">{examData.sections.length}</span>
              </div>
              <div className="col-md-3">
                <span className="text-secondary">Thời gian:</span>
                <span className="fw-semibold text-warning ms-2">{examData.totalDuration} phút</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-16 pb-16 border-bottom">
            <div>
              <h5 className="mb-1 fw-bold text-dark">
                <i className={`${steps[currentStep - 1].icon} me-2 text-primary`}></i>
                {steps[currentStep - 1].title}
              </h5>
              <p className="mb-0 text-sm text-secondary">{steps[currentStep - 1].description}</p>
            </div>
            <span className="badge bg-primary-subtle text-primary px-3 py-2">
              Bước {currentStep} / {steps.length}
            </span>
          </div>
          {renderStepContent()}
        </div>
      </div>

      <ToastContainer />

      {/* Custom Styles */}
      <style>{`
        .wizard-step {
          padding: 16px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .wizard-step.clickable:hover {
          background-color: #f8f9fa;
          transform: translateY(-2px);
        }

        .wizard-step.active {
          background-color: #eff6ff;
          border: 2px solid #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default CenterHeadExamWizard;
