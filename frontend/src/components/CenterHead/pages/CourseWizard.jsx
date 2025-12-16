import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import programService from '../../../services/programService';
import courseService from '../../../services/courseService';

// Import step components
import CourseStep1BasicInfo from './course-wizard-steps/CourseStep1BasicInfo';
import CourseStep2PLOMapping from './course-wizard-steps/CourseStep2PLOMapping';
import CourseStep3Materials from './course-wizard-steps/CourseStep2Materials';
import CourseStep4CLOMapping from './course-wizard-steps/CourseStep3CLOMapping';
import CourseStep5Sessions from './course-wizard-steps/CourseStep4Sessions';
import CamSession from './CamSession';

const CourseWizard = ({ viewMode = 'center-head' }) => {
  const navigate = useNavigate();
  const { programId, courseId } = useParams();
  const isEdit = Boolean(courseId);

  // Determine base path
  const basePath = viewMode === 'teacher' ? '/teacher' : '/center-head';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const autoSaveTimeoutRef = useRef(null);

  // Course data state
  const [courseData, setCourseData] = useState({
    _id: null,
    courseCode: '',
    name: '',
    description: '',
    numberOfSessions: 0,
    timeAllocation: '',
    preRequisite: 'None',
    studentTasks: '',
    learningType: 'offline',
    program: programId,
    mappedPLOs: [],
    materials: [],
    clos: [],
    sessions: [],
    mocktestSessionOrders: [],
    status: 'draft',
    lastCompletedStep: 0 // Track the last completed step (0 = not started, 1-5 = completed steps)
  });

    // Dynamic step 5 title and description based on conditions
    const getStep5Title = () => {
      // console.log(program);
      // console.log(courseData);
      
      if (program?.type === 'cam' && courseData?.learningType === 'online') {
        return 'CAM Sessions';
      }
      return 'Sessions';
    };
  
    const getStep5Description = () => {
      if (program?.type === 'cam' && courseData?.learningType === 'online') {
        return 'Tạo nội dung CAM Sessions với quiz và từ vựng';
      }
      return 'Tạo kế hoạch giảng dạy';
    };
  // Step configuration
  const steps = [
    {
      number: 1,
      title: 'Thông tin cơ bản',
      icon: 'ph ph-info',
      description: 'Thông tin cơ bản về học phần'
    },
    {
      number: 2,
      title: 'PLO Mapping',
      icon: 'ph ph-git-merge',
      description: 'Ánh xạ học phần với PLO của chương trình'
    },
    {
      number: 3,
      title: 'Tài liệu khóa học',
      icon: 'ph ph-books',
      description: 'Tài liệu tham khảo và học liệu'
    },
    {
      number: 4,
      title: 'CLO & Mapping',
      icon: 'ph ph-git-branch',
      description: 'Tạo CLO và ánh xạ với PLO'
    },
    {
      number: 5,
      title: getStep5Title(),
      icon: 'ph ph-calendar-blank',
      description: getStep5Description()
    }
  ];

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Dashboard', path: `${basePath}/dashboard` },
    { label: 'Quản lý chương trình', path: `${basePath}/programs` },
    { label: 'Chi tiết chương trình', path: `${basePath}/programs/${programId}` },
    { label: isEdit ? 'Chỉnh sửa học phần' : 'Tạo học phần mới' }
  ];

  // Load program data
  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        setLoading(true);
        const response = await programService.getProgramById(programId);
        setProgram(response.data);
      } catch (error) {
        console.error('Error loading program:', error);
        alert('Không thể tải thông tin chương trình!');
        navigate('/center-head/programs');
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchProgramData();
    }
  }, [programId, navigate]);

  // Load existing course if editing
  useEffect(() => {
    const fetchExistingCourse = async () => {
      if (isEdit && courseId) {
        try {
          const response = await courseService.getCourseById(courseId);
          const existingCourse = response.data;
          if (existingCourse) {
            setCourseData({
              _id: existingCourse._id,
              courseCode: existingCourse.courseCode,
              name: existingCourse.name,
              description: existingCourse.description || '',
              numberOfSessions: existingCourse.numberOfSessions || 0,
              timeAllocation: existingCourse.timeAllocation || '',
              preRequisite: existingCourse.preRequisite || 'None',
              studentTasks: existingCourse.studentTasks || '',
              learningType: existingCourse.learningType || 'offline',
              program: programId,
              mappedPLOs: existingCourse.mappedPLOs || [],
              materials: existingCourse.materials || [],
              clos: existingCourse.clos || [],
              sessions: existingCourse.sessions || [],
              mocktestSessionOrders: existingCourse.mocktestSessionOrders || [],
              status: existingCourse.status || 'draft',
              lastCompletedStep: existingCourse.lastCompletedStep || 0
            });

            // Restore current step to continue from where user left off
            // If lastCompletedStep exists, set currentStep to lastCompletedStep + 1 (next step)
            const resumeStep = (existingCourse.lastCompletedStep || 0) + 1;
            // Make sure we don't exceed total steps
            setCurrentStep(Math.min(resumeStep, 5));
          }
        } catch (error) {
          console.error('Error loading existing course:', error);
          alert('Không thể tải thông tin học phần hiện tại!');
        }
      }
    };

    fetchExistingCourse();
  }, [isEdit, courseId, programId]);

  // Handle step navigation
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber) => {
    // Allow navigation to completed steps only (based on lastCompletedStep)
    if (stepNumber <= courseData.lastCompletedStep + 1 && stepNumber >= 1) {
      setCurrentStep(stepNumber);
    }
  };

  // Handle exit with confirmation if unsaved changes
  const handleExit = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        'Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát không?\n\nLưu ý: Các thay đổi đã lưu vẫn được giữ lại.'
      );
      if (!confirm) return;
    }
    navigate(`${basePath}/programs/${programId}`);
  };

  // Calculate completion percentage
  const getProgressPercentage = () => {
    return Math.round((courseData.lastCompletedStep / 5) * 100);
  };

  // Get step status
  const getStepStatus = (stepNumber) => {
    if (stepNumber <= courseData.lastCompletedStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    if (stepNumber === courseData.lastCompletedStep + 1) return 'available';
    return 'locked';
  };

  // Render current step component
  const renderStepContent = () => {
    const commonProps = {
      courseData,
      setCourseData,
      program,
      onNext: handleNext,
      onPrevious: handlePrevious,
      isEdit,
      navigate
    };

    switch (currentStep) {
      case 1:
        return <CourseStep1BasicInfo {...commonProps} />;
      case 2:
        return <CourseStep2PLOMapping {...commonProps} />;
      case 3:
        return <CourseStep3Materials {...commonProps} />;
      case 4:
        return <CourseStep4CLOMapping {...commonProps} />;
      case 5:
        // Check if program type is 'cam' and course learning type is 'online'
        if (program?.type === 'cam' && courseData?.learningType === 'online') {
          // Render CamSession component for Cambridge online courses
          // Pass isWizardMode=true to hide breadcrumb and default navigation
          return (
            <div className="cam-session-wizard-wrapper">
              <CamSession
                isWizardMode={true}
                courseData={courseData}
                setCourseData={setCourseData}
                viewMode={viewMode}
              />
              {/* Custom navigation for wizard mode */}
              <div className="d-flex justify-content-between gap-3 mt-4 pt-4 border-top">
                <Button variant="outline" onClick={handlePrevious} icon="ph ph-arrow-left">
                  Quay lại
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      // Update course status to 'completed' and mark all steps as done
                      if (courseData._id) {
                        await courseService.updateCourse(courseData._id, {
                          status: 'completed',
                          lastCompletedStep: 5
                        });
                      }
                      alert('Hoàn thành tạo học phần với CAM Sessions!');
                      const programId = typeof courseData.program === 'object'
                        ? (courseData.program._id || courseData.program.id)
                        : courseData.program;
                      navigate(`${basePath}/programs/${programId}`);
                    } catch (error) {
                      console.error('Error updating course status:', error);
                      alert('Có lỗi khi cập nhật trạng thái học phần!');
                    }
                  }}
                  icon="ph ph-check-circle"
                  iconPosition="right"
                >
                  Hoàn thành
                </Button>
              </div>
            </div>
          );
        } else {
          // Render regular sessions component
          return <CourseStep5Sessions {...commonProps} />;
        }
      default:
        return null;
    }
  };

  if (loading || !program) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-body wizard-container">
      {/* Sticky Header with Progress */}
      <div className="wizard-header sticky-top bg-white shadow-sm mb-24 pb-16 pt-16" style={{ top: 0, zIndex: 100 }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between mb-12">
            <div className="d-flex align-items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleExit}
                icon="ph ph-x"
                className="text-neutral-600 hover:text-neutral-900"
              />
              <div>
                <h5 className="mb-0 fw-bold text-neutral-900">
                  {isEdit ? 'Chỉnh sửa học phần' : 'Tạo học phần mới'}
                </h5>
                {program && (
                  <small className="text-neutral-600">
                    <i className="ph ph-folder me-1"></i>
                    {program.program_name} ({program.code})
                  </small>
                )}
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              {/* Auto-save indicator */}
              <div className="d-flex align-items-center gap-2 px-3 py-2 rounded bg-light">
                {autoSaveStatus === 'saving' && (
                  <>
                    <i className="ph ph-spinner-gap text-primary-600" style={{ animation: 'spin 1s linear infinite' }}></i>
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
                    <span className="fw-bold text-xs text-primary-600">{currentStep}/5</span>
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

      <div className="row gy-4">
        {/* Enhanced Progress Steps */}
        <div className="col-lg-12">
          <Card className="shadow-sm">
            <div className="row g-3">
              {steps.map((step) => {
                const status = getStepStatus(step.number);
                const isClickable = status === 'completed' || status === 'active' || status === 'available';

                return (
                  <div key={step.number} className="col-lg col-md-4 col-sm-6">
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
          </Card>
        </div>

        {/* Data Summary Card */}
        {courseData._id && (
          <div className="col-lg-12">
            <div className="alert alert-light border d-flex align-items-start gap-3">
              <i className="ph ph-info text-primary-600 fs-4"></i>
              <div className="flex-grow-1">
                <div className="fw-semibold text-neutral-900 mb-2">Thông tin học phần</div>
                <div className="row g-2 text-xs">
                  <div className="col-md-3">
                    <span className="text-neutral-600">Mã học phần:</span>
                    <span className="fw-semibold text-neutral-900 ms-2">{courseData.courseCode || 'Chưa có'}</span>
                  </div>
                  <div className="col-md-3">
                    <span className="text-neutral-600">Tên:</span>
                    <span className="fw-semibold text-neutral-900 ms-2">{courseData.name || 'Chưa có'}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="text-neutral-600">Số buổi học:</span>
                    <span className="fw-semibold text-neutral-900 ms-2">{courseData.numberOfSessions || 0}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="text-neutral-600">PLO đã ánh xạ:</span>
                    <span className="fw-semibold text-primary-600 ms-2">{courseData.mappedPLOs?.length || 0}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="text-neutral-600">CLO đã tạo:</span>
                    <span className="fw-semibold text-success-600 ms-2">{courseData.clos?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="col-lg-12">
          <Card className="shadow-sm">
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
          </Card>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
      `}</style>
    </div>
  );
};

export default CourseWizard;