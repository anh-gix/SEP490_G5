import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionCard = ({
  title,
  icon,
  iconBg = 'bg-success-600',
  link,
  onClick,
  className = ''
}) => {
  const CardContent = () => (
    <div className={`bg-white rounded-3 p-20 border border-neutral-40 hover-shadow-md transition-all text-center ${className}`}>
      <div
        className={`${iconBg} d-flex align-items-center justify-content-center rounded-2 mx-auto mb-12`}
        style={{ width: '48px', height: '48px' }}
      >
        <i className={`${icon} text-white`} style={{ fontSize: '24px' }}></i>
      </div>
      <p className="text-neutral-700 fw-medium mb-0" style={{ fontSize: '14px' }}>
        {title}
      </p>
    </div>
  );

  if (link && !onClick) {
    return (
      <Link to={link} className="text-decoration-none d-block">
        <CardContent />
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        <CardContent />
      </div>
    );
  }

  return <CardContent />;
};

export default QuickActionCard;