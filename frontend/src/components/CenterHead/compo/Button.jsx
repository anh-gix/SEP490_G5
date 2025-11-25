import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  icon,
  iconPosition = 'left'
}) => {
  const variantClasses = {
    primary: 'btn-main',
    secondary: 'btn-outline-main',
    success: 'btn-success-600',
    danger: 'btn-danger-600',
    warning: 'btn-warning-600',
    outline: 'btn-outline-neutral-300',
  };

  const sizeClasses = {
    sm: 'btn-sm px-16 py-8 text-sm',
    md: 'btn-md px-24 py-12 text-base',
    lg: 'btn-lg px-32 py-16 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} radius-8 d-inline-flex align-items-center gap-2 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon && iconPosition === 'left' && <i className={icon}></i>}
      {children}
      {icon && iconPosition === 'right' && <i className={icon}></i>}
    </button>
  );
};

export default Button;