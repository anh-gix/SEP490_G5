import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * ToeicBreadcrumb - Breadcrumb navigation for TOEIC section
 */
const ToeicBreadcrumb = ({ currentPage, testTitle }) => {

  // Determine the breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const items = [
      {
        label: 'Trang chủ',
        path: '/student/dashboard',
        icon: 'fa-home'
      },
      {
        label: 'Luyện thi TOEIC',
        path: '/student/toeic',
        icon: 'fa-book'
      }
    ];

    // Add current page if provided
    if (currentPage) {
      items.push({
        label: currentPage,
        path: null, // Current page, no link
        icon: null
      });
    }

    // Add test title if on detail pages
    if (testTitle) {
      items.push({
        label: testTitle,
        path: null,
        icon: null
      });
    }

    return items;
  };

  const items = getBreadcrumbItems();

  return (
    <Breadcrumb className="mb-20" style={{ fontSize: '14px' }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isActive = isLast;

        return (
          <Breadcrumb.Item
            key={index}
            active={isActive}
            linkAs={isActive ? 'span' : Link}
            linkProps={!isActive ? { to: item.path } : {}}
            className={isActive ? 'text-neutral-600' : 'text-main-600'}
          >
            {item.icon && <i className={`fas ${item.icon} me-2`}></i>}
            {item.label}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default ToeicBreadcrumb;
