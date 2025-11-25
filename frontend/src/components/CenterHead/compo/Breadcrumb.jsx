import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="breadcrumb" className="mb-24">
      <ol className="breadcrumb d-flex align-items-center gap-2">
        {items.map((item, index) => (
          <li 
            key={index} 
            className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {index === items.length - 1 ? (
              <span className="text-neutral-600">{item.label}</span>
            ) : (
              <>
                <Link 
                  to={item.path} 
                  className="text-main-600 hover:text-main-700"
                >
                  {item.label}
                </Link>
                <i className="ph ph-caret-right ms-2"></i>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;