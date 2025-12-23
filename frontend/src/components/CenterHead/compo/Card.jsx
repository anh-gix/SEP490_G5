import React from 'react';

const Card = ({ children, className = '', title, actions, variant = 'border', style = {} }) => {
  // variant: 'border' (default) hoặc 'shadow'
  const baseClasses = variant === 'shadow'
    ? 'card border-0 rounded-12 bg-white'
    : 'card border border-neutral-200 radius-4';

  const shadowStyle = variant === 'shadow'
    ? { boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', ...style }
    : style;

  return (
    <div className={`${baseClasses} ${className}`} style={shadowStyle}>
      {(title || actions) && (
        <div className={`card-header d-flex justify-content-between align-items-center bg-white py-16 px-24 ${variant === 'shadow' ? 'border-0' : 'border-bottom border-neutral-200'}`}>
          {title && <h6 className="text-lg fw-semibold mb-0">{title}</h6>}
          {actions && <div className="d-flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="card-body p-24">
        {children}
      </div>
    </div>
  );
};

export default Card;