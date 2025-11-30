import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import programService from '../../../services/programService';

// Import step components
import CourseStep1BasicInfo from './course-wizard-steps/CourseStep1BasicInfo';
import CourseStep2PLOMapping from './course-wizard-steps/CourseStep2PLOMapping';
import CourseStep3Materials from './course-wizard-steps/CourseStep2Materials';
import CourseStep4CLOMapping from './course-wizard-steps/CourseStep3CLOMapping';
import CourseStep5Sessions from './course-wizard-steps/CourseStep4Sessions';

const CourseWizard = () => {
  const navigate = useNavigate();
  const { programId, courseId } = useParams();
  const isEdit = Boolean(courseId);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState(null);

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
    status: 'draft'
  });

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
      title: 'Sessions',
      icon: 'ph ph-calendar-blank',
      description: 'Tạo kế hoạch giảng dạy'
    }
  ];

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý chương trình', path: '/center-head/programs' },
    { label: 'Chi tiết chương trình', path: `/center-head/programs/${programId}` },
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
    if (isEdit && courseId && program) {
      const existingCourse = program.courses?.find(c => c._id === courseId);
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
          status: existingCourse.status || 'draft'
        });
      }
    }
  }, [isEdit, courseId, program]);

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
    // Allow navigation to completed steps or next step only
    if (stepNumber <= currentStep + 1 && stepNumber >= 1) {
      setCurrentStep(stepNumber);
    }
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
        return <CourseStep5Sessions {...commonProps} />;
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
    <div className="dashboard-body">
      <Breadcrumb items={breadcrumbItems} />

      {/* Program Info Alert */}
      {program && (
        <div className="alert alert-info mb-24">
          <i className="ph ph-info me-2"></i>
          Đang tạo học phần cho chương trình: <strong>{program.program_name}</strong> ({program.code})
        </div>
      )}

      <div className="row gy-4">
        {/* Progress Steps */}
        <div className="col-lg-12">
          <Card>
            <div className="row">
              {steps.map((step, index) => (
                <div key={step.number} className="col-lg col-md-4 col-6">
                  <div
                    className={`text-center cursor-pointer ${
                      currentStep === step.number ? 'text-primary-600' :
                      currentStep > step.number ? 'text-success-600' :
                      'text-neutral-400'
                    }`}
                    onClick={() => handleStepClick(step.number)}
                    style={{
                      cursor: step.number <= currentStep + 1 ? 'pointer' : 'not-allowed',
                      opacity: step.number <= currentStep + 1 ? 1 : 0.5
                    }}
                  >
                    <div className="d-flex flex-column align-items-center gap-2 mb-3">
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center ${
                          currentStep === step.number
                            ? 'bg-primary-600 text-white'
                            : currentStep > step.number
                            ? 'bg-success-600 text-white'
                            : 'bg-neutral-100 text-neutral-400'
                        }`}
                        style={{ width: '48px', height: '48px', fontSize: '20px' }}
                      >
                        {currentStep > step.number ? (
                          <i className="ph ph-check"></i>
                        ) : (
                          <i className={step.icon}></i>
                        )}
                      </div>
                      <div>
                        <div className="fw-semibold text-sm">Bước {step.number}</div>
                        <div className="text-xs">{step.title}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="d-none d-lg-block">
                        <hr
                          className={`${
                            currentStep > step.number
                              ? 'border-success-600'
                              : 'border-neutral-200'
                          }`}
                          style={{ margin: '0 auto', width: '80%' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Step Content */}
        <div className="col-lg-12">
          <Card title={steps[currentStep - 1].title}>
            <p className="text-neutral-600 mb-24">{steps[currentStep - 1].description}</p>
            {renderStepContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseWizard;