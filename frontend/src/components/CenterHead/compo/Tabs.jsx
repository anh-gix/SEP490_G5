import React, { useState } from 'react';

const Tabs = ({
  tabs,
  defaultActiveKey = 0,
  activeTab: controlledActiveTab,
  onChange,
  className = ''
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultActiveKey);

  // Use controlled or uncontrolled state
  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (tabId) => {
    if (isControlled) {
      // Controlled mode: call onChange
      onChange && onChange(tabId);
    } else {
      // Uncontrolled mode: update internal state
      setInternalActiveTab(tabId);
    }
  };

  return (
    <div className={`common-tab ${className}`}>
      <ul className="nav nav-tabs border-bottom border-neutral-40" role="tablist">
        {tabs.map((tab, index) => {
          const tabId = tab.id !== undefined ? tab.id : index;
          const isActive = isControlled
            ? activeTab === tabId
            : activeTab === index;

          return (
            <li className="nav-item" role="presentation" key={tabId}>
              <button
                className={`nav-link px-24 py-12 ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(tabId)}
                type="button"
                role="tab"
              >
                {tab.icon && <i className={`${tab.icon} me-2`}></i>}
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Only render content if tabs have content property */}
      {tabs.some(tab => tab.content) && (
        <div className="tab-content mt-24">
          {tabs.map((tab, index) => {
            const tabId = tab.id !== undefined ? tab.id : index;
            const isActive = isControlled
              ? activeTab === tabId
              : activeTab === index;

            return (
              <div
                key={tabId}
                className={`tab-pane fade ${isActive ? 'show active' : ''}`}
                role="tabpanel"
              >
                {isActive && tab.content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tabs;