import React from 'react';

const Card = ({ children, className = '', title, actions }) => {
  return (
    <div className={`card border border-neutral-40 radius-8 ${className}`}>
      {(title || actions) && (
        <div className="card-header d-flex justify-content-between align-items-center bg-neutral-10 border-bottom border-neutral-40 py-16 px-24">
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