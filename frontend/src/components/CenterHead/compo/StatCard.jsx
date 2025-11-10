import React from 'react';

const StatCard = ({
  title,
  value,
  change,
  changeType = 'increase', // 'increase' or 'decrease'
  icon,
  iconBgColor = 'bg-main-600',
  className = ''
}) => {
  const changeColor = changeType === 'increase' ? 'text-success-600' : 'text-danger-600';
  const changeIcon = changeType === 'increase' ? 'ph ph-trend-up' : 'ph ph-trend-down';

  return (
    <div className={`bg-white rounded-3 p-24 border border-neutral-40 ${className}`}>
      <div className="d-flex align-items-start justify-content-between mb-20">
        <div className="flex-grow-1">
          <p className="text-neutral-600 mb-8 fw-medium" style={{ fontSize: '14px' }}>
            {title}
          </p>
          <h2 className="text-neutral-900 fw-bold mb-0" style={{ fontSize: '32px' }}>
            {value}
          </h2>
          {change && (
            <div className="d-flex align-items-center gap-1 mt-12">
              <i className={`${changeIcon} ${changeColor}`} style={{ fontSize: '16px' }}></i>
              <span className={`${changeColor} fw-semibold`} style={{ fontSize: '13px' }}>
                {change}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`${iconBgColor} d-flex align-items-center justify-content-center rounded-2`}
            style={{ width: '56px', height: '56px', flexShrink: 0 }}
          >
            <i className={`${icon} text-white`} style={{ fontSize: '28px' }}></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;