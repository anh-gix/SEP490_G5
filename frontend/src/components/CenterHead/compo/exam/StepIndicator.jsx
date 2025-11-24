import React from 'react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="d-flex align-items-start justify-content-between">
      {steps.map((step) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <div key={step.number} className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
            {/* Step Circle */}
            <div className="position-relative">
              <div
                className={`d-flex align-items-center justify-content-center rounded-circle fw-bold transition-all ${
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
                  <i className="ph ph-check"></i>
                ) : (
                  step.number
                )}
              </div>
            </div>

            {/* Step Label */}
            <div className="text-center mt-3">
              <div
                className={`text-sm fw-semibold mb-1 ${
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
  );
};

export default StepIndicator;
