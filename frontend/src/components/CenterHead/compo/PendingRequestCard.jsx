import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';

const PendingRequestCard = ({
  title,
  subtitle,
  count = 0,
  link,
  iconBg = 'bg-warning-600',
  icon = 'ph ph-book-open',
  actionLabel = 'Xem Chi Tiết',
  onAction,
  actions,
  className = ''
}) => {
  const CardContent = () => (
    <div className={`bg-white rounded-3 p-24 border border-neutral-40 hover-shadow-lg transition-all ${className}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          {/* Icon with count badge */}
          <div className="position-relative" style={{ flexShrink: 0 }}>
            <div
              className={`${iconBg} d-flex align-items-center justify-content-center rounded-2`}
              style={{ width: '56px', height: '56px' }}
            >
              <i className={`${icon} text-white`} style={{ fontSize: '24px' }}></i>
            </div>
            {count > 0 && (
              <div
                className="position-absolute d-flex align-items-center justify-content-center bg-danger-600 text-white rounded-circle fw-bold"
                style={{
                  width: '24px',
                  height: '24px',
                  fontSize: '12px',
                  top: '-4px',
                  right: '-4px',
                  border: '2px solid white'
                }}
              >
                {count > 99 ? '99+' : count}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-grow-1">
            <h6 className="text-neutral-900 fw-semibold mb-4" style={{ fontSize: '16px' }}>
              {title}
            </h6>
            {subtitle && (
              <p className="text-neutral-500 mb-0" style={{ fontSize: '13px' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions or Arrow */}
        {actions ? (
          <div className="d-flex gap-2">
            {actions}
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2">
            {actionLabel && (
              <span className="text-main-600 fw-medium" style={{ fontSize: '14px' }}>
                {actionLabel}
              </span>
            )}
            <i className="ph ph-caret-right text-neutral-400" style={{ fontSize: '20px' }}></i>
          </div>
        )}
      </div>
    </div>
  );

  if (link && !onAction) {
    return (
      <Link to={link} className="text-decoration-none d-block">
        <CardContent />
      </Link>
    );
  }

  if (onAction) {
    return (
      <div onClick={onAction} className="cursor-pointer">
        <CardContent />
      </div>
    );
  }

  return <CardContent />;
};

export default PendingRequestCard;