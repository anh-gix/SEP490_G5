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
    primary: 'btn-main text-white',
    secondary: 'btn-outline-main',
    'outline-secondary': 'btn-outline-secondary',
    success: 'bg-success-600 text-white border-success-600',
    danger: 'bg-danger-600 text-white border-danger-600',
    warning: 'bg-warning-600 text-white border-warning-600',
    edit: 'bg-orange-600 text-white border-orange-600',
    info: 'bg-info-600 text-white border-info-600',
    outline: 'bg-white text-neutral-700 border-neutral-300',
    ghost: 'bg-transparent text-neutral-700 border-0',
  };

  const variantHoverStyles = {
    success: { backgroundColor: 'var(--success-700)', borderColor: 'var(--success-700)' },
    danger: { backgroundColor: 'var(--danger-700)', borderColor: 'var(--danger-700)' },
    warning: { backgroundColor: 'var(--warning-700)', borderColor: 'var(--warning-700)' },
    edit: { backgroundColor: 'var(--orange-700)', borderColor: 'var(--orange-700)' },
    info: { backgroundColor: 'var(--info-700)', borderColor: 'var(--info-700)' },
  };

  const sizeClasses = {
    sm: 'btn-sm px-16 py-8 text-sm',
    md: 'btn-md px-24 py-12 text-base',
    lg: 'btn-lg px-32 py-16 text-lg',
  };

  const buttonClass = `btn ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size]} radius-8 d-inline-flex align-items-center gap-2 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
      style={{
        border: '1px solid',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled && variantHoverStyles[variant]) {
          Object.assign(e.currentTarget.style, variantHoverStyles[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '';
          e.currentTarget.style.borderColor = '';
        }
      }}
    >
      {icon && iconPosition === 'left' && <i className={icon}></i>}
      {children}
      {icon && iconPosition === 'right' && <i className={icon}></i>}
    </button>
  );
};

export default Button;