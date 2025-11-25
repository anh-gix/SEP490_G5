import React, { useState } from 'react';

const Tabs = ({ tabs, defaultActiveKey = 0, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveKey);

  return (
    <div className={`common-tab ${className}`}>
      <ul className="nav nav-tabs border-bottom border-neutral-40 mb-24" role="tablist">
        {tabs.map((tab, index) => (
          <li className="nav-item" role="presentation" key={index}>
            <button
              className={`nav-link px-24 py-12 ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
              type="button"
              role="tab"
            >
              {tab.icon && <i className={`${tab.icon} me-2`}></i>}
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`}
            role="tabpanel"
          >
            {activeTab === index && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;