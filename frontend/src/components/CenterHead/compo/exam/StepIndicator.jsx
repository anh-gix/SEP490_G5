import React from 'react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="bg-white rounded-16 border border-neutral-200 p-24">
      <div className="d-flex align-items-center justify-content-between position-relative">
        {/* Progress Line */}
        <div className="position-absolute top-50 start-0 end-0 translate-middle-y" style={{ height: '2px', zIndex: 0 }}>
          <div className="bg-neutral-200 w-100 h-100"></div>
          <div
            className="bg-main-600 h-100 position-absolute top-0 start-0 transition-all"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 1, flex: 1 }}>
              {/* Step Circle */}
              <div
                className={`d-flex align-items-center justify-content-center rounded-circle fw-bold mb-12 transition-all ${
                  isCompleted
                    ? 'bg-main-600 text-white'
                    : isActive
                    ? 'bg-main-600 text-white'
                    : 'bg-neutral-200 text-neutral-500'
                }`}
                style={{
                  width: '48px',
                  height: '48px',
                  fontSize: '18px',
                  border: isActive ? '4px solid rgba(13, 110, 253, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {isCompleted ? (
                  <i className="fas fa-check"></i>
                ) : (
                  step.number
                )}
              </div>

              {/* Step Label */}
              <div className="text-center">
                <div
                  className={`text-xs fw-semibold mb-4 ${
                    isActive ? 'text-main-600' : isCompleted ? 'text-neutral-700' : 'text-neutral-500'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-neutral-500">
                  {step.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
