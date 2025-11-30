import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import programService from '../../../services/programService';

// Import step components
import Step1ProgramInfo from './wizard-steps/Step1ProgramInfo';
import Step2PLOManagement from './wizard-steps/Step2PLOManagement';
import Step3CourseCreation from './wizard-steps/Step3CourseCreation';
import Step4CLOPLOMapping from './wizard-steps/Step4CLOPLOMapping';
import Step5SessionGeneration from './wizard-steps/Step5SessionGeneration';
import Step6ReviewSubmit from './wizard-steps/Step6ReviewSubmit';

const ProgramWizard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Program data state
  const [programData, setProgramData] = useState({
    _id: null,
    code: '',
    program_name: '',
    description: '',
    type: 'ielts',
    level: 'B1',
    band: '4.0-5.0',
    tuitionFee: 0,
    plos: [],
    courses: [],
    status: 'draft'
  });

  // Current course being created/edited in steps 3-5
  const [currentCourse, setCurrentCourse] = useState(null);

  // Step configuration
  const steps = [
    {
      number: 1,
      title: 'Thông tin chương trình',
      icon: 'ph ph-info',
      description: 'Thông tin cơ bản về chương trình'
    },
    {
      number: 2,
      title: 'PLO Management',
      icon: 'ph ph-target',
      description: 'Quản lý Program Learning Outcomes'
    },
    {
      number: 3,
      title: 'Tạo học phần',
      icon: 'ph ph-book',
      description: 'Tạo khóa học cho chương trình'
    },
    {
      number: 4,
      title: 'CLO & Mapping',
      icon: 'ph ph-git-branch',
      description: 'Tạo CLO và ánh xạ với PLO'
    },
    {
      number: 5,
      title: 'Tạo buổi học',
      icon: 'ph ph-calendar-blank',
      description: 'Tạo sessions và ánh xạ CLO'
    },
    {
      number: 6,
      title: 'Xem lại & Nộp',
      icon: 'ph ph-check-circle',
      description: 'Kiểm tra và nộp để duyệt'
    }
  ];

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý chương trình', path: '/center-head/programs' },
    { label: isEdit ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới' }
  ];

  // Load existing program if editing
  useEffect(() => {
    if (isEdit && id) {
      const fetchProgramData = async () => {
        try {
          setLoading(true);
          const response = await programService.getProgramById(id);
          const data = response.data;

          setProgramData({
            _id: data._id,
            code: data.code,
            program_name: data.program_name,
            description: data.description || '',
            type: data.type,
            level: data.level,
            band: data.band || '',
            tuitionFee: data.tuitionFee || 0,
            plos: data.plos || [],
            courses: data.courses || [],
            status: data.status
          });
        } catch (error) {
          console.error('Error loading program:', error);
          alert('Không thể tải thông tin chương trình!');
          navigate('/center-head/programs');
        } finally {
          setLoading(false);
        }
      };

      fetchProgramData();
    }
  }, [isEdit, id, navigate]);

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
      programData,
      setProgramData,
      currentCourse,
      setCurrentCourse,
      onNext: handleNext,
      onPrevious: handlePrevious,
      isEdit
    };

    switch (currentStep) {
      case 1:
        return <Step1ProgramInfo {...commonProps} />;
      case 2:
        return <Step2PLOManagement {...commonProps} />;
      case 3:
        return <Step3CourseCreation {...commonProps} />;
      case 4:
        return <Step4CLOPLOMapping {...commonProps} />;
      case 5:
        return <Step5SessionGeneration {...commonProps} />;
      case 6:
        return <Step6ReviewSubmit {...commonProps} navigate={navigate} />;
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

      <div className="row gy-4">
        {/* Progress Steps */}
        <div className="col-lg-12">
          <Card>
            <div className="row">
              {steps.map((step, index) => (
                <div key={step.number} className="col-lg-2 col-md-4 col-sm-6">
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

export default ProgramWizard;
