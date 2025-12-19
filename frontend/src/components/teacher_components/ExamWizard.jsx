import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { examService } from '../../services/examService';
import { workRequestService } from '../../services/workRequestService';

// Import step components
import ExamWizardIntro from './ExamWizardIntro';
import ExamStep1BasicInfo from './exam-wizard-steps/ExamStep1BasicInfo';
import ExamStep2SectionsConfig from './exam-wizard-steps/ExamStep2SectionsConfig';
import ExamStep3UploadAnswerKeys from './exam-wizard-steps/ExamStep3UploadAnswerKeys';
import ExamStep4Review from './exam-wizard-steps/ExamStep4Review';
import ExamSuccessModal from './ExamSuccessModal';

const ExamWizard = ({ viewMode = 'teacher' }) => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const isEdit = Boolean(examId);

  // Determine base path
  const basePath = viewMode === 'teacher' ? '/teacher' : '/center-head';

  const [showIntro, setShowIntro] = useState(false); // No intro screen - always directly to wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [workRequest, setWorkRequest] = useState(null); // Store work request data

  // Exam data state
  const [examData, setExamData] = useState({
    _id: null,
    title: '',
    description: '',
    examType: 'cambridge',
    totalDuration: 170,
    sections: [],
    status: 'draft',
    lastCompletedStep: 0, // Track the last completed step
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
      title: 'Review & Submit',
      icon: 'ph ph-check-circle',
      description: 'Review và submit để duyệt'
    }
  ];

  // Load existing exam if editing
  useEffect(() => {
    const loadExamData = async () => {
      if (!isEdit || !examId) return;

      try {
        setLoading(true);

        // Fetch exam data
        const response = await examService.getExamByIdForManagement(examId);
        const exam = response.data;

        // Set exam data
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

        // Try to fetch associated work request
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const requestsResponse = await workRequestService.getAssignedToMe({
            userId: user._id,
            requestType: 'create_exam',
            direction: 'top_down'
          });

          // Find the request linked to this exam
          const linkedRequest = requestsResponse.data?.find(req =>
            (typeof req.entityId === 'object' ? req.entityId._id : req.entityId) === examId
          );

          if (linkedRequest) {
            setWorkRequest(linkedRequest);
          }
        } catch (requestError) {
          console.warn('Could not fetch work request:', requestError);
          // Non-critical error - exam can still be edited
        }

      } catch (error) {
        console.error('Error loading exam:', error);
        alert(error.message || 'Không thể tải dữ liệu đề thi!');
        navigate(`${basePath}/exams`);
      } finally {
        setLoading(false);
      }
    };

    loadExamData();
  }, [isEdit, examId, navigate, basePath]);

  // Intro Screen handlers
  const handleStartWizard = () => {
    setShowIntro(false);
  };

  const handleCancelIntro = () => {
    navigate(`${basePath}/exams`);
  };

  // Success Modal handlers
  const handleViewExam = () => {
    setShowSuccessModal(false);
    // Navigate to exam details page
    navigate(`${basePath}/exams/${examData._id}/details`);
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    // Reset wizard
    window.location.href = `${basePath}/exams/create`;
  };

  const handleGoToExamList = () => {
    setShowSuccessModal(false);
    navigate(`${basePath}/exams`);
  };

  // Auto-save function
  const autoSaveExam = async () => {
    if (!examData._id) return;

    try {
      setAutoSaveStatus('saving');
      const formattedData = examService.formatExamData(examData);
      await examService.updateExamForManagement(examData._id, formattedData);
      setAutoSaveStatus('saved');
      console.log('✅ Auto-saved exam');
    } catch (error) {
      console.error('Error auto-saving exam:', error);
      setAutoSaveStatus('error');
    }
  };

  // Auto-save when examData changes (debounced)
  useEffect(() => {
    if (!examData._id || !isEdit) return;

    // Debounce auto-save - wait 3 seconds after last change
    const timeoutId = setTimeout(() => {
      autoSaveExam();
    }, 3000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examData]);

  // Handle step navigation with auto-save
  const handleNext = async () => {
    if (currentStep < steps.length) {
      // Auto-save before moving to next step
      await autoSaveExam();

      // Update lastCompletedStep if current step is completed
      const updatedData = {
        ...examData,
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
    // Allow navigation to completed steps only
    if (stepNumber <= examData.lastCompletedStep + 1 && stepNumber >= 1) {
      setCurrentStep(stepNumber);
    }
  };

  // Handle exit with auto-save
  const handleExit = async () => {
    // Auto-save before exiting if there's exam data
    if (examData._id) {
      if (window.confirm('💾 Bạn có muốn lưu thay đổi trước khi thoát không?')) {
        await autoSaveExam();
      }
    }
    navigate(`${basePath}/exams`);
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      setAutoSaveStatus('saving');

      // First, save the current exam state
      if (examData._id) {
        const formattedData = examService.formatExamData(examData);
        await examService.updateExamForManagement(examData._id, formattedData);
      }

      // Then, complete the work request if it exists
      if (workRequest && workRequest._id) {
        await workRequestService.completeRequest(workRequest._id, {
          note: 'Đã hoàn thành tạo đề thi'
        });

        setAutoSaveStatus('saved');
        setShowSuccessModal(true);
      } else {
        // Fallback: If no work request found, this shouldn't happen in the new flow
        console.warn('No work request found - exam may not be linked to a work request');
        setAutoSaveStatus('saved');
        alert('⚠️ Đề thi đã được lưu nhưng không tìm thấy yêu cầu công việc liên kết. Vui lòng liên hệ quản trị viên.');
        navigate(`${basePath}/exams`);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      setAutoSaveStatus('error');
      alert(error.message || 'Không thể hoàn thành đề thi!');
    }
  };

  // Calculate completion percentage
  const getProgressPercentage = () => {
    return Math.round((examData.lastCompletedStep / 4) * 100);
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
        return <ExamStep1BasicInfo {...commonProps} />;
      case 2:
        return <ExamStep2SectionsConfig {...commonProps} />;
      case 3:
        return <ExamStep3UploadAnswerKeys {...commonProps} />;
      case 4:
        return <ExamStep4Review {...commonProps} onSubmit={handleSubmit} />;
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

  // Show Intro Screen for new exams
  if (showIntro && !isEdit) {
    return (
      <div className="dashboard-body wizard-container py-5">
        <ExamWizardIntro
          onStart={handleStartWizard}
          onCancel={handleCancelIntro}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-body wizard-container">
      {/* Success Modal */}
      <ExamSuccessModal
        show={showSuccessModal}
        examData={examData}
        onViewExam={handleViewExam}
        onCreateAnother={handleCreateAnother}
        onGoToExamList={handleGoToExamList}
      />

      {/* Sticky Header with Progress */}
      <div className="wizard-header bg-white shadow-sm pb-16 pt-16" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between mb-12">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-ghost"
                onClick={handleExit}
              >
                <i className="ph ph-x"></i>
              </button>
              <div>
                <h5 className="mb-0 fw-bold text-neutral-900">
                  {isEdit ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}
                </h5>
                <small className="text-neutral-600">
                  <i className="ph ph-exam me-1"></i>
                  {examData.title || 'Chưa có tên'}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              {/* Auto-save indicator */}
              <div className="d-flex align-items-center gap-2 px-3 py-2 rounded bg-light">
                {autoSaveStatus === 'saving' && (
                  <>
                    <i className="ph ph-spinner-gap text-primary-600 spinner"></i>
                    <span className="text-xs text-neutral-600">Đang lưu...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <i className="ph ph-check-circle text-success-600"></i>
                    <span className="text-xs text-success-600">Đã lưu</span>
                  </>
                )}
                {autoSaveStatus === 'error' && (
                  <>
                    <i className="ph ph-warning-circle text-danger-600"></i>
                    <span className="text-xs text-danger-600">Lỗi lưu</span>
                  </>
                )}
              </div>

              {/* Progress percentage */}
              <div className="d-flex align-items-center gap-2">
                <div className="text-end">
                  <div className="fw-bold text-sm text-neutral-900">{getProgressPercentage()}%</div>
                  <div className="text-xxs text-neutral-600">Hoàn thành</div>
                </div>
                <div className="position-relative" style={{ width: '60px', height: '60px' }}>
                  <svg width="60" height="60" className="progress-ring">
                    <circle
                      cx="30"
                      cy="30"
                      r="26"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="26"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - getProgressPercentage() / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 30 30)"
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <span className="fw-bold text-xs text-primary-600">{currentStep}/4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress" style={{ height: '6px' }}>
            <div
              className="progress-bar bg-success-600"
              role="progressbar"
              style={{ width: `${getProgressPercentage()}%`, transition: 'width 0.5s ease' }}
              aria-valuenow={getProgressPercentage()}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>

      <div className="row gy-4 px-24 py-24">
        {/* Enhanced Progress Steps */}
        <div className="col-lg-12">
          <div className="card shadow-sm border-0">
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
                          {/* Step circle */}
                          <div
                            className={`step-circle ${
                              status === 'completed'
                                ? 'bg-success-600 text-white shadow'
                                : status === 'active'
                                ? 'bg-primary-600 text-white shadow-lg'
                                : status === 'available'
                                ? 'bg-primary-100 text-primary-600 border border-primary-600'
                                : 'bg-neutral-100 text-neutral-400'
                            }`}
                          >
                            {status === 'completed' ? (
                              <i className="ph-fill ph-check-circle"></i>
                            ) : status === 'locked' ? (
                              <i className="ph ph-lock"></i>
                            ) : (
                              <i className={step.icon}></i>
                            )}
                          </div>

                          {/* Step info */}
                          <div className="text-center">
                            <div className={`fw-bold text-xs mb-1 ${
                              status === 'active' ? 'text-primary-600' :
                              status === 'completed' ? 'text-success-600' :
                              'text-neutral-600'
                            }`}>
                              Bước {step.number}
                            </div>
                            <div className={`text-xs ${
                              status === 'active' ? 'text-neutral-900 fw-semibold' :
                              status === 'completed' ? 'text-neutral-700' :
                              'text-neutral-500'
                            }`}>
                              {step.title}
                            </div>

                            {/* Status badge */}
                            {status === 'active' && (
                              <span className="badge bg-primary-100 text-primary-600 mt-1 text-xxs">
                                Đang thực hiện
                              </span>
                            )}
                            {status === 'completed' && (
                              <span className="badge bg-success-100 text-success-600 mt-1 text-xxs">
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
        </div>

        {/* Data Summary Card */}
        {examData._id && (
          <div className="col-lg-12">
            <div className="alert alert-light border d-flex align-items-start gap-3">
              <i className="ph ph-info text-primary-600 fs-4"></i>
              <div className="flex-grow-1">
                <div className="fw-semibold text-neutral-900 mb-2">Thông tin đề thi</div>
                <div className="row g-2 text-xs">
                  <div className="col-md-3">
                    <span className="text-neutral-600">Tên:</span>
                    <span className="fw-semibold text-neutral-900 ms-2">{examData.title || 'Chưa có'}</span>
                  </div>
                  <div className="col-md-3">
                    <span className="text-neutral-600">Loại:</span>
                    <span className="fw-semibold text-neutral-900 ms-2 text-uppercase">{examData.examType}</span>
                  </div>
                  <div className="col-md-3">
                    <span className="text-neutral-600">Sections:</span>
                    <span className="fw-semibold text-primary-600 ms-2">{examData.sections.length}</span>
                  </div>
                  <div className="col-md-3">
                    <span className="text-neutral-600">Câu hỏi:</span>
                    <span className="fw-semibold text-success-600 ms-2">
                      {examData.sections.reduce((sum, s) => sum + (s.questionCount || 0), 0)}
                    </span>
                  </div>
                  <div className="col-md-3">
                    <span className="text-neutral-600">Thời gian:</span>
                    <span className="fw-semibold text-warning-600 ms-2">{examData.totalDuration} phút</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="col-lg-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-16 pb-16 border-bottom">
                <div>
                  <h5 className="mb-1 fw-bold text-neutral-900">
                    <i className={`${steps[currentStep - 1].icon} me-2 text-primary-600`}></i>
                    {steps[currentStep - 1].title}
                  </h5>
                  <p className="mb-0 text-sm text-neutral-600">{steps[currentStep - 1].description}</p>
                </div>
                <span className="badge bg-primary-50 text-primary-600 px-3 py-2">
                  Bước {currentStep} / {steps.length}
                </span>
              </div>
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        .wizard-step {
          padding: 16px;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
        }

        .wizard-step.clickable:hover {
          background-color: #f8f9fa;
          transform: translateY(-2px);
        }

        .wizard-step.active {
          background-color: #eff6ff;
          border: 2px solid #3b82f6;
        }

        .step-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.3s ease;
        }

        .wizard-step.active .step-circle {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        }

        .wizard-header {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bg-success-600 {
          background-color: #16a34a;
        }

        .bg-primary-600 {
          background-color: #2563eb;
        }

        .bg-primary-100 {
          background-color: #dbeafe;
        }

        .text-primary-600 {
          color: #2563eb;
        }

        .text-success-600 {
          color: #16a34a;
        }

        .bg-success-100 {
          background-color: #dcfce7;
        }

        .bg-primary-50 {
          background-color: #eff6ff;
        }
      `}</style>
    </div>
  );
};

ExamWizard.propTypes = {
  viewMode: PropTypes.oneOf(['teacher', 'center-head']),
};

export default ExamWizard;
