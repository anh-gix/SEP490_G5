import React from 'react';

const Badge = ({ children, variant = 'primary', size = 'md', className = '' }) => {
  const variantClasses = {
    primary: 'bg-main-600 text-white',
    secondary: 'bg-neutral-100 text-neutral-700',
    success: 'bg-main-three-600 text-white',
    warning: 'bg-main-two-600 text-white',
    danger: 'bg-danger-600 text-white',
    info: 'bg-info-600 text-white',
  };

  const sizeClasses = {
    sm: 'px-8 py-2 text-xs',
    md: 'px-12 py-4 text-sm',
    lg: 'px-16 py-6 text-base',
  };

  return (
    <span 
      className={`badge radius-4 fw-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;